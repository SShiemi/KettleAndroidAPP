package com.se.aguapronta

import com.google.firebase.database.Exclude
import com.google.firebase.database.IgnoreExtraProperties


@IgnoreExtraProperties
data class Kettle(
    var available: String? = "",
    var cur_water: Int? = 0,
    var status: String? = ""
) {

    @Exclude
    fun toMap(): Map<String, Any?> {
        return mapOf(
            "available" to available,
            "cur_water" to cur_water,
            "status" to status
        )
    }
}


data class Reservation(
    var amount: Int? = 0,
    var status: String? = "",
    var userUid: String? = ""
) {

    @Exclude
    fun toMap(): Map<String, Any?> {
        return mapOf(
            "amount" to amount,
            "status" to status,
            "userUid" to userUid
        )
    }
}

data class UserReservation(
    var amount: Int? = 0,
    var status: String? = "",
    var userUid: String? = ""
) {

    @Exclude
    fun toMap(): Map<String, Any?> {
        return mapOf(
            "amount" to amount,
            "status" to status,
            "userUid" to userUid
        )
    }
}




