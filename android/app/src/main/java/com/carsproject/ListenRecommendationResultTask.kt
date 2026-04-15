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

class ListenRecommendationResultTask : HeadlessJsTaskService() {

    @RequiresApi(Build.VERSION_CODES.O)
    override fun getTaskConfig(intent: Intent?): HeadlessJsTaskConfig? {
        val extras: Bundle? = intent?.extras

        Log.v("ResultTask", "Hello that: ${LocalDateTime.now()}")

        return extras?.let {
            HeadlessJsTaskConfig(
                "ListenRecommendationResultTask",
                Arguments.fromBundle(it),
                0, // Timeout in milliseconds
                true // Allow in foreground
            )
        }
    }
}
