package com.foodsocial.app.features.notification

internal sealed interface NotificationTarget {
    data class Recipe(val recipeId: String) : NotificationTarget
    data class Diary(val entryId: String) : NotificationTarget
}

internal data class SampleNotification(
    val id: String,
    val title: String,
    val message: String,
    val receivedAt: Long,
    val target: NotificationTarget? = null,
)

internal fun sampleNotifications(now: Long = System.currentTimeMillis()) = listOf(
    SampleNotification(
        "recipe-spotlight", "Món Việt hôm nay",
        "Khám phá cách nấu Phở bò tại nhà và lưu món vào danh sách yêu thích.",
        now - 45 * 60_000L,
        NotificationTarget.Recipe("homestyle-beef-pho"),
    ),
    SampleNotification(
        "diary-recap", "Xem lại nhật ký của bạn",
        "Món Thịt kho trứng có trong nhật ký mẫu.",
        now - 5 * 3_600_000L,
        NotificationTarget.Diary("sample-diary"),
    ),
    SampleNotification(
        "welcome", "Chào mừng đến CookMate",
        "Bạn có thể dành một phiên để khám phá món ăn, quản lý nguyên liệu và ghi lại những món đã nấu.",
        now - 24 * 3_600_000L,
    ),
)
