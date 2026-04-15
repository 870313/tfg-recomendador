package com.carsproject

import android.os.Parcel
import android.os.Parcelable
import okhttp3.internal.notifyAll
import okhttp3.internal.wait
import java.util.concurrent.CountDownLatch
import java.util.concurrent.TimeUnit

class SiddhiResult : Parcelable {

    @Volatile
    private var result: String? = null
    @Volatile
    private var latch: CountDownLatch = CountDownLatch(1)
    private var isReady = false
    constructor()
    constructor(parcel: Parcel) : this() {
        result = parcel.readString()
    }

    @Synchronized
    fun setResult(value: String?) {
        result = value
        latch.countDown() // despierta a todos los que esperan
    }

    @Synchronized
    fun getResult(): String {
        val r = result ?: ""
        result = ""
        return r
    }
    @Synchronized
    fun waitForResult(timeoutMs: Long = 20000): String? {
        // Bloquea hasta que setResult() llame a countDown() o hasta timeout
        return if (latch.await(timeoutMs, TimeUnit.MILLISECONDS)) {
            val r = result
            reset() // para reutilizar en futuras llamadas
            r
        } else {
            null // timeout: nunca llegó resultado
        }
    }

    private fun reset() {
        // preparar para un nuevo ciclo de espera
        result = null
        latch = CountDownLatch(1)
    }
    override fun writeToParcel(parcel: Parcel, flags: Int) {
        parcel.writeString(result)
    }

    override fun describeContents(): Int = 0

    companion object CREATOR : Parcelable.Creator<SiddhiResult> {
        override fun createFromParcel(parcel: Parcel): SiddhiResult {
            return SiddhiResult(parcel)
        }

        override fun newArray(size: Int): Array<SiddhiResult?> {
            return arrayOfNulls(size)
        }
    }
}

