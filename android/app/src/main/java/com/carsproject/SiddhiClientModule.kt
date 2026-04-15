package com.carsproject

import android.content.ComponentName
import android.content.Context
import android.content.Intent
import android.content.ServiceConnection
import android.os.IBinder
import android.os.RemoteException
import android.util.Log

import com.facebook.react.bridge.Callback
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.bridge.ReactContextBaseJavaModule
import com.facebook.react.bridge.ReactMethod

import org.apache.log4j.BasicConfigurator

class SiddhiClientModule(reactContext: ReactApplicationContext) : ReactContextBaseJavaModule(reactContext) {

    companion object {
        private const val TAG = "SIDDHI CLIENT MODULE"
    }

    private var siddhiService: SiddhiService? = null
    private var mBound = false
    private var appName: String? = null
    private var context: Context = reactContext

    private val connection = object : ServiceConnection {
        override fun onServiceConnected(className: ComponentName, service: IBinder) {
            Log.d(TAG, "onServiceConnected")
            val binder = service as SiddhiService.SiddhiBinder
            siddhiService = binder.getService()
            mBound = true
        }

        override fun onServiceDisconnected(name: ComponentName) {
            mBound = false
        }
    }

    init {
        Log.d(TAG, "constructor")
        BasicConfigurator.configure()
    }

    @ReactMethod(isBlockingSynchronousMethod = true)
    fun connect() {
        Log.d(TAG, "connect()")
        context = reactApplicationContext
        val intent = Intent(context, SiddhiService::class.java)
        context.startService(intent)
        context.bindService(intent, connection, Context.BIND_AUTO_CREATE)
    }

    @ReactMethod
    fun startApp(app: String) {
        Log.d(TAG, "startApp()")
        if (mBound) {
            try {
                appName = siddhiService?.startSiddhiApp(app)
            } catch (e: RemoteException) {
                e.printStackTrace()
            }
        }
    }

    @ReactMethod
    fun stopApp() {
        Log.d(TAG, "stopApp()")
        if (mBound) {
            try {
                appName?.let { siddhiService?.stopSiddhiApp() }
            } catch (e: RemoteException) {
                e.printStackTrace()
            }
        }
    }

    @ReactMethod
    fun sendEvent(context: String) {
        if (mBound) {
            Log.d(TAG, "sendEvent()")
            siddhiService?.sendEvent(context)
        }
    }

    @ReactMethod
    fun getResult(callback: Callback) {
        if (mBound) {
            val r = Task(callback)
            Thread(r).start()
        }
    }

    @ReactMethod
    fun isStopped(callback: Callback) {
        if (mBound) {
            Log.d(TAG, "IS BOUND")
            Log.d(TAG, "isStopped()")
            val isStopped = siddhiService?.isStopped()
            callback.invoke(isStopped)
        } else {
            Log.d(TAG, "IS NOT BOUND")
            callback.invoke("unbound")
        }
    }

    override fun getName(): String {
        return "SiddhiClientModule"
    }

    private inner class Task(private val callback: Callback) : Runnable {

        override fun run() {
            Log.d(TAG, "Running thread for getting result")
            try {
                val result = siddhiService?.getResultObject()
                val r = result?.waitForResult()
                Log.d(TAG, "Thread while ended")
                Log.d(TAG, r ?: "null")
                callback.invoke(r ?: "")
            } catch (e: RemoteException) {
                e.printStackTrace()
            } catch (e: InterruptedException) {
                e.printStackTrace()
            }
        }
    }
}
