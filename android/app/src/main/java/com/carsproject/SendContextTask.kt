package com.carsproject

import android.content.Intent
import android.os.Build
import android.os.Bundle
import android.util.Log
import androidx.annotation.RequiresApi
import com.facebook.react.HeadlessJsTaskService
import com.facebook.react.bridge.Arguments
import com.facebook.react.jstasks.HeadlessJsTaskConfig
import java.time.LocalDateTime

// Headless.js task for sending events and getting results
class SendContextTask : HeadlessJsTaskService() {

    @RequiresApi(Build.VERSION_CODES.O)
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val extras: Bundle? = intent?.extras

        Log.v("CARS", "Hello that: ${LocalDateTime.now()}")

        return extras?.let {
            HeadlessJsTaskConfig(
                "SendContextTask",
                Arguments.fromBundle(it),
                5000, // Timeout for the task in ms
                true  // Allow running in foreground
            )
        }
    }
}
