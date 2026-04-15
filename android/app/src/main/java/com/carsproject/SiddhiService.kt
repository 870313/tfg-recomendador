package com.carsproject

import android.app.*
import android.content.Context
import android.content.Intent
import android.os.*
import android.util.Log
import com.carsproject.siddhi.SiddhiAppManager

class SiddhiService : Service() {

    private val binder = SiddhiBinder(this)
    private var intent: Intent? = null
    private var isStopped: Boolean = true
    private val siddhiAppManager = SiddhiAppManager(this)

    companion object {
        private const val TAG = "SIDDHI SERVICE"
        private var siddhiService: SiddhiService? = null
    }

    class SiddhiBinder(private val service: SiddhiService) : Binder() {
        fun getService(): SiddhiService = service
    }

    override fun onBind(intent: Intent?): IBinder {
        return binder
    }

    private fun printThreadDump() {
        for (thread in Thread.getAllStackTraces().keys) {
            Log.d("ThreadDump", "Thread: ${thread.name} (${thread.state})")
        }
    }
    // Public methods for clients

    @Throws(RemoteException::class)
    fun startSiddhiApp(siddhiApp: String): String {
        return if (isStopped) {
            Log.d(TAG, "startSiddhiApp()")
            siddhiAppManager.startSiddhiApp(siddhiApp)
            isStopped = false
            printThreadDump()
            siddhiApp
        } else {
            Log.d(TAG, "startSiddhiApp does nothing bc not stopped")
            ""
        }
    }

    @Throws(RemoteException::class)
    fun stopSiddhiApp() {
        if (!isStopped) {
            Log.d(TAG, "stopSiddhiApp()")
            printThreadDump()
            isStopped = true
            siddhiAppManager.stopSiddhiApp()
            printThreadDump()
        } else {
            Log.d(TAG, "stopSiddhiApp does nothing bc is already stopped")
        }
    }

    fun sendEvent(context: String) {
        if (!isStopped) {
            Log.d(TAG, "sendEvent()")
            siddhiAppManager.sendEvent(context)
        } else {
            Log.d(TAG, "sendEvent does nothing bc is already stopped")
        }
    }

    fun getResult(): String = siddhiAppManager.getResult()

    @Throws(RemoteException::class)
    fun getResultObject(): SiddhiResult = siddhiAppManager.getResultObject()

    fun isStopped(): Boolean = isStopped

    override fun onCreate() {
        super.onCreate()
        intent = Intent("SiddhiService")
        siddhiService = this
        Log.d(TAG, "onCreate()")
    }

    override fun onDestroy() {
        super.onDestroy()
        siddhiService = null
    }

    override fun onStartCommand(intent: Intent?, flags: Int, startId: Int): Int {
        val notification = createNotification(
            "es.unizar.eina.siddhibackground",
            "SIDDHI_CHANNEL", "Siddhi",
            "Siddhi Platform Service started", R.drawable.icon, 100, false
        )
        startForeground(100, notification)
        return START_STICKY
    }

    fun createNotification(
        notificationChannelId: String,
        notificationChannelName: String,
        notificationTitle: String,
        notificationBody: String,
        notificationIcon: Int,
        notificationId: Int,
        enableStyle: Boolean
    ): Notification {
        val notificationManager = getSystemService(Context.NOTIFICATION_SERVICE) as NotificationManager
        val notification: Notification

        val channel = NotificationChannel(
            notificationChannelId,
            notificationChannelName,
            NotificationManager.IMPORTANCE_DEFAULT
        )
        notificationManager.createNotificationChannel(channel)
        val builder = Notification.Builder(applicationContext, notificationChannelId)
            .setContentTitle(notificationTitle)
            .setContentText(notificationBody)
            .setSmallIcon(notificationIcon)
            .setAutoCancel(true)

        if (enableStyle) {
            builder.setStyle(Notification.BigTextStyle().bigText(notificationBody))
        }
        notification = builder.build()

        notificationManager.notify(notificationId, notification)
        return notification
    }
}
