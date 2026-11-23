package com.foodsocial.app.domain.model

import java.util.Calendar

internal data class FoodDiaryEntry(val id: String, val recipeId: String, val cookedAt: Long)

internal fun startOfDiaryDay(daysAgo: Int = 0, now: Long = System.currentTimeMillis()): Long =
    Calendar.getInstance().apply {
        timeInMillis = now
        add(Calendar.DAY_OF_YEAR, -daysAgo)
        set(Calendar.HOUR_OF_DAY, 0)
        set(Calendar.MINUTE, 0)
        set(Calendar.SECOND, 0)
        set(Calendar.MILLISECOND, 0)
    }.timeInMillis
