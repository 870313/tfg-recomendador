package com.carsproject.p2p

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.util.Log
import androidx.core.content.ContextCompat
import com.google.android.gms.nearby.Nearby
import com.google.android.gms.nearby.connection.*
import android.os.Handler
import android.os.Looper

class P2PService(private val context: android.content.Context) {

    private val handler = Handler(Looper.getMainLooper())
    private val connectionsClient = Nearby.getConnectionsClient(context)
    private val strategy = Strategy.P2P_CLUSTER
    private var connectedEndpoints: MutableSet<String> = mutableSetOf()
    // Estado interno
    private var running = false
    //Callback cuando llegan datos
    var onDataReceived: ((String) -> Unit)? = null
    var onConnected: ((String) -> Unit)? = null

    // Valores configurables
    private val rediscoveryIntervalInitial = 30_000L   // 30s iniciales
    private val rediscoveryMaxDelay = 5 * 60_000L      // 5 minutos máximo
    private var currentRediscoveryDelay = rediscoveryIntervalInitial

    // Guardar los valores con los que arrancamos para relanzarlos
    private var storedServiceName: String? = null
    private var storedUserId: String? = null

    // Runnable que relanza discovery periódicamente (watchdog)
    private val rediscoveryRunnable = object : Runnable {
        override fun run() {
            if (running) {
                Log.d("P2PService", "Watchdog: forzando discovery (delay=${currentRediscoveryDelay})")
                // Llamamos a restartDiscovery para gestionar backoff y restart seguro
                restartDiscovery()
                // reprogramar próximo chequeo según backoff actual
                handler.postDelayed(this, currentRediscoveryDelay)
            }
        }
    }

    //Iniciar Advertising + Discovery
    fun start(serviceName: String, userId: String) {
        // Guardamos para relanzamientos posteriores
        storedServiceName = serviceName
        storedUserId = userId

        // Iniciar Advertising + Discovery inicial
        startAdvertising(serviceName, userId)
        startDiscovery(serviceName)
        running = true

        // Reset del backoff al arrancar
        currentRediscoveryDelay = rediscoveryIntervalInitial

        // Iniciar watchdog que reintentará discovery periódicamente
        handler.postDelayed(rediscoveryRunnable, currentRediscoveryDelay)
    }

    fun stop() {
        try {
            connectionsClient.stopAdvertising()
            connectionsClient.stopDiscovery()
            connectionsClient.stopAllEndpoints()
        } catch (e: Exception) {
            Log.w("P2PService", "Error al parar Nearby: ${e.message}")
        }

        connectedEndpoints.clear()
        Log.d("P2PService", "Servicio parado")
        running = false

        // limpiar watchdog
        handler.removeCallbacks(rediscoveryRunnable)
        // reset backoff
        currentRediscoveryDelay = rediscoveryIntervalInitial
    }




    fun isStopped(): Boolean {
        return !running
    }

    //Enviar datos a todos los conectados
    fun sendData(data: String) {
        val payload = Payload.fromBytes(data.toByteArray())
        connectedEndpoints.forEach { endpointId ->
            connectionsClient.sendPayload(endpointId, payload)
        }
    }

    // =====================
    // Nearby API Callbacks
    // =====================

    private fun startAdvertising(serviceName: String, userId: String) {
        val advertisingOptions = AdvertisingOptions.Builder().setStrategy(strategy).build()
        connectionsClient.startAdvertising(
            userId,  // nombre del endpoint
            serviceName,
            connectionLifecycleCallback,
            advertisingOptions
        ).addOnSuccessListener {
            Log.d("P2PService", "Advertising iniciado")
        }.addOnFailureListener {
            Log.e("P2PService", "Error en advertising: ${it.message}")
        }
    }

    private fun startDiscovery(serviceName: String) {
        val discoveryOptions = DiscoveryOptions.Builder().setStrategy(strategy).build()
        connectionsClient.startDiscovery(
            serviceName,
            endpointDiscoveryCallback,
            discoveryOptions
        ).addOnSuccessListener {
            Log.d("P2PService", "Discovery iniciado")
            // éxito -> reset del backoff
            currentRediscoveryDelay = rediscoveryIntervalInitial
        }.addOnFailureListener {
            Log.e("P2PService", "Error en discovery: ${it.message}")
        }
    }

    //Descubrimiento de dispositivos
    private val endpointDiscoveryCallback = object : EndpointDiscoveryCallback() {
        override fun onEndpointFound(endpointId: String, info: DiscoveredEndpointInfo) {
            Log.d("P2PService", "Dispositivo encontrado: $endpointId (${info.endpointName})")
            // Conectar automáticamente
            connectionsClient.requestConnection("P2PDevice", endpointId, connectionLifecycleCallback)
        }

        override fun onEndpointLost(endpointId: String) {
            Log.d("P2PService", "Dispositivo perdido: $endpointId")
            connectedEndpoints.remove(endpointId)
            // relanzar discovery para volver a encontrar peers
            restartDiscovery()
        }
    }

    // Reinicio del descubrimiento
    private fun restartDiscovery(immediate: Boolean = false) {
        // Evitar llamadas concurrentes
        try {
            connectionsClient.stopDiscovery()
        } catch (e: Exception) {
            Log.w("P2PService", "stopDiscovery fallo: ${e.message}")
        }

        val delay = if (immediate) 0L else currentRediscoveryDelay
        handler.postDelayed({
            storedServiceName?.let { sName ->
                startDiscovery(sName)
            } ?: Log.w("P2PService", "No storedServiceName; no se puede relanzar discovery")
        }, delay)

        // aumentar backoff para la próxima vez (doble hasta el máximo)
        currentRediscoveryDelay = (currentRediscoveryDelay * 2).coerceAtMost(rediscoveryMaxDelay)
    }

    // 🔹 Ciclo de vida de la conexión
    private val connectionLifecycleCallback = object : ConnectionLifecycleCallback() {
        override fun onConnectionInitiated(endpointId: String, connectionInfo: ConnectionInfo) {
            Log.d("P2PService", "Conexión iniciada con $endpointId")
            // Aceptar automáticamente
            connectionsClient.acceptConnection(endpointId, payloadCallback)
        }

        override fun onConnectionResult(endpointId: String, result: ConnectionResolution) {
            if (result.status.isSuccess) {
                Log.d("P2PService", "Conexión establecida con $endpointId")
                connectedEndpoints.add(endpointId)
                // reiniciamos backoff — si hay una conexión establecida, preferimos discovery estable
                currentRediscoveryDelay = rediscoveryIntervalInitial
                //Avisar al modulo de la conexion
                onConnected?.invoke(endpointId)
            } else {
                Log.e("P2PService", "Conexión fallida con $endpointId")
            }
        }

        override fun onDisconnected(endpointId: String) {
            Log.d("P2PService", "Desconectado de $endpointId")
            connectedEndpoints.remove(endpointId)
            restartDiscovery(immediate = true) // reintentar de inmediato
        }
    }

    // Recepción de datos
    private val payloadCallback = object : PayloadCallback() {
        override fun onPayloadReceived(endpointId: String, payload: Payload) {
            payload.asBytes()?.let {
                val message = String(it)
                Log.d("P2PService", "Datos recibidos: $message")
                onDataReceived?.invoke(message)
            }
        }

        override fun onPayloadTransferUpdate(endpointId: String, update: PayloadTransferUpdate) {
            // Mandar informacion pesada
        }
    }

}
