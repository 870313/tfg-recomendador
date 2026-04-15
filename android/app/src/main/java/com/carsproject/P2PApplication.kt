package com.carsproject

import android.Manifest
import android.content.pm.PackageManager
import android.os.Build
import android.os.Bundle
import android.util.Log
import android.widget.Button
import android.widget.TextView
import androidx.appcompat.app.AppCompatActivity
import androidx.core.app.ActivityCompat
import androidx.core.content.ContextCompat
import com.carsproject.p2p.P2PService

class P2PApplication : AppCompatActivity() {

    private lateinit var p2pService: P2PService
    private lateinit var messagesView: TextView
    private lateinit var sendButton: Button

    private val REQUEST_CODE_PERMISSIONS = 1001

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)
        setContentView(R.layout.activity_main)

        messagesView = findViewById(R.id.messagesView)
        sendButton = findViewById(R.id.sendButton)

        p2pService = P2PService(this)

        // Callback para mostrar datos recibidos
        p2pService.onDataReceived = { data ->
            runOnUiThread {
                messagesView.append("Recibido: $data\n")
            }
            Log.d("P2PApplication", "Datos recibidos: $data")
        }

        // Pedir permisos correctos
        checkAndRequestPermissions()

        // Enviar datos
        sendButton.setOnClickListener {
            val message = "Hola desde ${System.currentTimeMillis()}"
            p2pService.sendData(message)
            messagesView.append("Enviado: $message\n")
        }
    }

    override fun onRequestPermissionsResult(
        requestCode: Int,
        permissions: Array<String>,
        grantResults: IntArray
    ) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults)
        if (requestCode == REQUEST_CODE_PERMISSIONS) {
            val allGranted = grantResults.isNotEmpty() && grantResults.all { it == PackageManager.PERMISSION_GRANTED }
            if (allGranted) {
                startP2P()
            } else {
                Log.e("P2PApplication", "Permisos requeridos denegados: ${permissions.joinToString()}")
            }
        }
    }

    private fun startP2P() {
        p2pService.start(serviceName = "R-Rules", userId = "user_${System.currentTimeMillis()}")
    }

    override fun onDestroy() {
        super.onDestroy()
        p2pService.stop()
    }

    /**
     * Devuelve todos los permisos necesarios según la versión de Android
     */
    private fun requiredPermissionsForDevice(): Array<String> {
        val perms = mutableListOf<String>()

        // Comunes
        perms += Manifest.permission.ACCESS_WIFI_STATE
        perms += Manifest.permission.CHANGE_WIFI_STATE

        // Ubicación (para Nearby discovery en Android <12)
        perms += Manifest.permission.ACCESS_FINE_LOCATION
        perms += Manifest.permission.ACCESS_COARSE_LOCATION

        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.TIRAMISU) { // 33+
            perms += Manifest.permission.NEARBY_WIFI_DEVICES
            perms += Manifest.permission.BLUETOOTH_SCAN
            perms += Manifest.permission.BLUETOOTH_CONNECT
            perms += Manifest.permission.BLUETOOTH_ADVERTISE
        } else if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.S) { // 31..32
            perms += Manifest.permission.BLUETOOTH_SCAN
            perms += Manifest.permission.BLUETOOTH_CONNECT
            perms += Manifest.permission.BLUETOOTH_ADVERTISE
        }

        return perms.toTypedArray()
    }


    /**
     * Comprueba y pide permisos faltantes
     */
    private fun checkAndRequestPermissions() {
        val required = requiredPermissionsForDevice().filter {
            ContextCompat.checkSelfPermission(this, it) != PackageManager.PERMISSION_GRANTED
        }.toTypedArray()

        if (required.isNotEmpty()) {
            ActivityCompat.requestPermissions(this, required, REQUEST_CODE_PERMISSIONS)
        } else {
            startP2P()
        }
    }
}
