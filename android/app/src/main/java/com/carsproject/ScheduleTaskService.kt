package com.carsproject

import android.app.Service
import android.content.Intent
import android.os.Bundle
import android.os.Handler
import android.os.IBinder
import android.os.Looper
import android.util.Log
import com.facebook.react.HeadlessJsTaskService

class ScheduleTaskService : Service() {

    companion object {
        const val NOTIFY_INTERVAL: Long = 30_000L // 30 seconds
    }

    private val handler = Handler(Looper.getMainLooper())
    private val taskRunnable = object : Runnable {
        override fun run() {
            try {
                val context = applicationContext
                val service = Intent(context, SendContextTask::class.java).apply {
                    putExtras(Bundle().apply {
                        putString("foo", "bar")
                    })
                }
                context.startService(service)
                HeadlessJsTaskService.acquireWakeLockNow(context)
            } catch (e: Exception) {
                Log.e("ScheduleTaskService", "Error in taskRunnable", e)
            } finally {
                // Reprogram next execution
                handler.postDelayed(this, NOTIFY_INTERVAL)
            }
        }
    }

    override fun onBind(intent: Intent?): IBinder? = null

    override fun onCreate() {
        super.onCreate()
        Log.d("ScheduleTaskService", "onCreate: initiating scheduling")
        // First execution starts immediately
        handler.post(taskRunnable)
    }

    override fun onDestroy() {
        super.onDestroy()
        Log.d("ScheduleTaskService", "onDestroy: stopping scheduling")
        handler.removeCallbacks(taskRunnable)
    }
}
