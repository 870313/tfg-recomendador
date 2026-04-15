package com.carsproject.p2p

import com.facebook.react.bridge.*
import com.facebook.react.modules.core.DeviceEventManagerModule

class P2PModule(private val reactContext: ReactApplicationContext) :
    ReactContextBaseJavaModule(reactContext) {

    private var p2pService: P2PService? = null

    override fun getName() = "P2PModule"

    @ReactMethod
    fun start(serviceName: String, userId: String) {
        if (p2pService == null) {
            p2pService = P2PService(reactContext)
        }
        p2pService?.apply {
            onDataReceived = { data ->
                sendEvent("onDataReceived", data) // Datos recibidos
            }
            onConnected = { endpointId ->
                sendEvent("onConnected", endpointId) // Conexion recibida
            }
            start(serviceName, userId)
        }
    }

    @ReactMethod
    fun stop() {
        p2pService?.stop()
    }

    @ReactMethod
    fun isStopped(promise: Promise) {
        val result = p2pService?.isStopped() ?: true // si null -> lo tratamos como "parado"
        promise.resolve(result)
    }

    @ReactMethod
    fun sendData(message: String) {
        p2pService?.sendData(message)
    }

    //Métodos requeridos por RN para eventos
    @ReactMethod
    fun addListener(eventName: String) {
        //
    }

    @ReactMethod
    fun removeListeners(count: Int) {
        //
    }

    private fun sendEvent(eventName: String, data: String) {
        reactContext
            .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter::class.java)
            .emit(eventName, data)
    }
}
