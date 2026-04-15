package com.carsproject.siddhi

import android.content.Context
import android.util.Log
import com.google.gson.JsonObject
import com.carsproject.SiddhiResult
import io.siddhi.core.SiddhiAppRuntime
import io.siddhi.core.SiddhiManager
import io.siddhi.core.event.Event
import io.siddhi.core.query.output.callback.QueryCallback
import io.siddhi.core.stream.input.InputHandler
import io.siddhi.core.stream.output.StreamCallback
import okhttp3.internal.notify
import java.io.BufferedReader
import java.io.IOException
import java.io.InputStreamReader

class SiddhiAppManager(private val context: Context) {

    companion object {
        private const val TAG = "SIDDHIAPPMANAGER"
    }

    private val siddhiManager = SiddhiManager()
    private var siddhiAppRuntime: SiddhiAppRuntime? = null
    private var inputHandler: InputHandler? = null
    private var appName: String? = null
    private var app: String? = null
    private val result = SiddhiResult().apply { setResult("start") }

    // Experiments
    private var startTime: Long = 0
    private var totalActivations: Long = 0
    public val timeList = mutableListOf<Long>()

    fun startSiddhiApp(newApp: String): String? {
        Log.d(TAG, "startSiddhiApp")

        app = newApp.ifEmpty {
            readSiddhiRulesFromFile()
            app
        }

        siddhiAppRuntime = siddhiManager.createSiddhiAppRuntime(app)
        appName = siddhiAppRuntime?.name
        inputHandler = siddhiAppRuntime?.getInputHandler("Context")

        siddhiAppRuntime?.addCallback("finalResults", object : QueryCallback() {
            override fun receive(timestamp: Long, inEvents: Array<Event>?, removeEvents: Array<Event>?) {
                var data = ""
                inEvents?.get(0)?.data?.forEach {
                    data += "$it,"
                }

                Log.d(TAG, "result manager hashCode: ${result.hashCode()}")
                Log.d(TAG, "Going to set result")
                result.setResult(data)
                Log.d(TAG, "Notify done")
            }
        })


        // Receive each recommendation triggering rule
        siddhiAppRuntime?.addCallback("Results", object : StreamCallback() {
            override fun receive(events: Array<Event>) {
                val endTime = System.currentTimeMillis()
                val executionTime = endTime - startTime
                Log.d("Siddhi", "Execution time: $executionTime ms")

                // Guardamos la latencia
                timeList.add(executionTime)

                // Contamos cuántos eventos llegaron en este callback
                Log.d("Siddhi", "Eventos recibidos en este batch: ${events.size}")

                // Si quieres un total acumulado:
                totalActivations += events.size
                Log.d("Siddhi", "Total activaciones hasta ahora: $totalActivations")
            }
        })



        siddhiAppRuntime?.start()
        return appName
    }

    fun stopSiddhiApp() {
        Log.d(TAG, "STOPPED")
        siddhiAppRuntime?.shutdown()
    }

    fun sendEvent(context: String) {
        Log.d(TAG, "EVENT SENT")
        try {
            startTime = System.currentTimeMillis()
            inputHandler?.send(arrayOf(context))
            Log.d(TAG, "EVENT SENT: DONE")
        } catch (e: InterruptedException) {
            e.printStackTrace()
        }
    }

    fun getResult(): String {
        return result.getResult()
    }

    fun getResultObject(): SiddhiResult {
        return result
    }

    private fun readSiddhiRulesFromFile() {
        try {
            val file = BufferedReader(InputStreamReader(context.assets.open("example.txt")))
            app = readAllLines(file)
            Log.d(TAG, app!!)
        } catch (e: IOException) {
            e.printStackTrace()
        }
    }

    private fun readAllLines(reader: BufferedReader): String {
        val content = StringBuilder()
        var line: String?
        while (reader.readLine().also { line = it } != null) {
            content.append(line).append(System.lineSeparator())
        }
        return content.toString()
    }

    private fun createUserContext(): UserContext {
        val userContextJson = JsonObject().apply {
            addProperty("hasId", "22")
            addProperty("date", "2021/07/28")
            addProperty("time", "11:40:00")
            addProperty("status", "onHolidays")
            addProperty("atHome", "no")
        }

        val preference1 = JsonObject().apply {
            addProperty("typeOf", "Shows")
            addProperty("where", "Open-Air")
        }
        val preference2 = JsonObject().apply {
            addProperty("typeOf", "Music")
            addProperty("where", "Indoor")
        }
        val preference3 = JsonObject().apply {
            addProperty("typeOf", "Culture")
            addProperty("where", "Both")
        }

        val observation = JsonObject().apply {
            addProperty("observedBy", "sensorTEst")
            addProperty("featureOfInterest", "Me")
            addProperty("observedProperty", "WeatherStatus")
            addProperty("observationValue", "Snow")
            addProperty("timeOfMeasurement", "10:00:00")
        }

        val preferences = listOf(preference1, preference2, preference3)
        val observations = listOf(observation)

        return UserContext(userContextJson, preferences, observations)
    }
}
