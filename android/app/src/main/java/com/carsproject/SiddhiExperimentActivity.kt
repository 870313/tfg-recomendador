package com.carsproject

import android.os.Bundle
import android.util.Log
import androidx.appcompat.app.AppCompatActivity
import com.carsproject.siddhi.SiddhiAppManager
import org.json.JSONObject
import java.io.File
import java.util.concurrent.Executors
import java.util.concurrent.ScheduledFuture
import java.util.concurrent.TimeUnit

class SiddhiExperimentActivity : AppCompatActivity() {

    private lateinit var siddhiManager: SiddhiAppManager
    private val scheduler = Executors.newSingleThreadScheduledExecutor()
    private var scheduledTask: ScheduledFuture<*>? = null

    // Lista de contextos generada desde JSON
    private val contexts: List<String> by lazy { loadContextsFromAsset("21-random-context.json") }

    // Mapa para guardar latencias por contexto
    private val latenciesPerContext = mutableMapOf<String, Long>()
    // Número máximo de triggering rules a usar en esta ejecución
    private val maxTriggeringRules = 200

    override fun onCreate(savedInstanceState: Bundle?) {
        super.onCreate(savedInstanceState)

        siddhiManager = SiddhiAppManager(this)

        startAutomaticExperiment()
    }

    private fun startAutomaticExperiment() {
        Log.d("Experiment", "Starting automatic experiment...")

        // Cargar Siddhi App (context rules + n triggering rules)
        val siddhiAppString = loadSiddhiAppFromAssets("example.txt")  // Ya contiene hasta maxTriggeringRules
        siddhiManager.startSiddhiApp(siddhiAppString)
        siddhiManager.timeList.clear()

        var contextIndex = 0
        val totalContexts = contexts.size

        scheduledTask = scheduler.scheduleWithFixedDelay({
            if (contextIndex >= totalContexts) {
                // Terminar experimento automáticamente
                scheduledTask?.cancel(true)
                siddhiManager.stopSiddhiApp()
                printLatencies()
                Log.d("Experiment", "Experiment finished automatically")
                return@scheduleWithFixedDelay
            }

            val ctx = contexts[contextIndex]
            Log.d("Experiment", "Sending context ${contextIndex + 1} / $totalContexts")
            Log.d("Experiment", "Context JSON: $ctx") // <-- nuevo log
            siddhiManager.sendEvent(ctx)
            contextIndex++

        }, 0, 20, TimeUnit.SECONDS)
    }


    private fun printLatencies() {
        Log.d("Experiment", "=== Latencies Start ===")
        siddhiManager.timeList.forEachIndexed { index, latency ->
            Log.d("Experiment", "${index + 1}:$latency")
        }
        Log.d("Experiment", "=== Latencies End ===")
    }


    private fun loadContextsFromAsset(filename: String): List<String> {
        val jsonString = assets.open(filename).bufferedReader().use { it.readText() }
        val contextList = mutableListOf<String>()
        val jsonObject = JSONObject(jsonString)
        val defaultArray = jsonObject.getJSONArray("default")
        for (i in 0 until defaultArray.length()) {
            contextList.add(defaultArray.getJSONObject(i).toString())
        }
        return contextList
    }

    private fun loadSiddhiAppFromAssets(filename: String): String {
        return assets.open(filename).bufferedReader().use { it.readText() }
    }
}
