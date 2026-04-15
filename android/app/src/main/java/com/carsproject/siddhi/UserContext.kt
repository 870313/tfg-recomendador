package com.carsproject.siddhi

import com.google.gson.JsonObject

data class UserContext(
    val userContext: JsonObject,
    val preferences: List<JsonObject>,
    val observations: List<JsonObject>
)
