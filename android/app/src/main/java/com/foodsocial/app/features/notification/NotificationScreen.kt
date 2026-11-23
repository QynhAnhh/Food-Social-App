package com.foodsocial.app.features.notification

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.RecipeEmpty
import com.foodsocial.app.core.designsystem.RecipeHeader
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
internal fun NotificationScreen(
    notifications: List<SampleNotification>,
    readIds: Set<String>,
    isTargetAvailable: (NotificationTarget) -> Boolean,
    onBack: () -> Unit,
    onRead: (SampleNotification) -> Unit,
    onOpen: (SampleNotification) -> Unit,
    onReadAll: () -> Unit,
    onClearRead: () -> Unit,
) {
    val timeFormat = remember { SimpleDateFormat("HH:mm · dd/MM/yyyy", Locale.forLanguageTag("vi-VN")) }
    var confirmingClear by rememberSaveable { mutableStateOf(false) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(10.dp),
    ) {
        item {
            RecipeHeader("Thông báo", onBack)
            if (notifications.isNotEmpty()) {
                FlowRow(horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                    TextButton(
                        onClick = onReadAll,
                        enabled = notifications.any { it.id !in readIds },
                    ) { Text("Đánh dấu tất cả đã đọc") }
                    TextButton(
                        onClick = { confirmingClear = true },
                        enabled = notifications.any { it.id in readIds },
                    ) { Text("Xóa đã đọc") }
                }
            }
        }
        if (notifications.isEmpty()) {
            item { RecipeEmpty("Chưa có thông báo", "Thông báo mới sẽ xuất hiện ở đây.") }
        }
        items(notifications, key = { it.id }) { notification ->
            val read = notification.id in readIds
            val canOpen = notification.target?.let(isTargetAvailable) == true
            val interactive = canOpen || !read
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(
                    containerColor = if (read) MaterialTheme.colorScheme.surfaceContainerLow
                    else MaterialTheme.colorScheme.secondaryContainer,
                ),
            ) {
                Column(
                    Modifier.fillMaxWidth()
                        .clickable(enabled = interactive, role = Role.Button, onClick = { onOpen(notification) })
                        .padding(14.dp),
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Text(notification.title, style = MaterialTheme.typography.titleMedium)
                    Text(notification.message, style = MaterialTheme.typography.bodyMedium)
                    val state = if (read) "Đã đọc" else "Chưa đọc"
                    Text("$state · ${timeFormat.format(Date(notification.receivedAt))}", style = MaterialTheme.typography.labelMedium)
                    if (canOpen) {
                        Text(
                            when (notification.target) {
                                is NotificationTarget.Recipe -> "Xem công thức ›"
                                is NotificationTarget.Diary -> "Xem nhật ký ›"
                            },
                            color = MaterialTheme.colorScheme.primary,
                            style = MaterialTheme.typography.labelLarge,
                        )
                    } else if (notification.target != null) {
                        Text("Nội dung liên quan không còn khả dụng.", style = MaterialTheme.typography.bodySmall)
                    }
                }
                if (!read) {
                    TextButton(onClick = { onRead(notification) }, modifier = Modifier.padding(horizontal = 6.dp)) {
                        Text("Đánh dấu đã đọc")
                    }
                }
            }
        }
    }

    if (confirmingClear) AlertDialog(
        onDismissRequest = { confirmingClear = false },
        title = { Text("Xóa thông báo đã đọc?") },
        text = { Text("Thông báo chưa đọc sẽ vẫn có trong danh sách.") },
        confirmButton = {
            TextButton(onClick = {
                confirmingClear = false
                onClearRead()
            }) { Text("Xác nhận xóa") }
        },
        dismissButton = { TextButton(onClick = { confirmingClear = false }) { Text("Hủy") } },
    )
}
