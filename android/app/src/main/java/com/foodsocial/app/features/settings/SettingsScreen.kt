package com.foodsocial.app.features.settings

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.selection.toggleable
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.RecipeHeader

@Composable
internal fun SettingsScreen(
    guest: Boolean,
    largeText: Boolean,
    onLargeText: (Boolean) -> Unit,
    onBack: () -> Unit,
    onLogin: () -> Unit,
    onSignOut: () -> Unit,
) {
    val context = LocalContext.current
    val version = remember(context) {
        context.packageManager.getPackageInfo(context.packageName, 0).versionName
    }
    var confirming by rememberSaveable { mutableStateOf(false) }

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        RecipeHeader("Cài đặt", onBack)
        Text("Giao diện", style = MaterialTheme.typography.titleLarge)
        Card {
            ListItem(
                modifier = Modifier.toggleable(largeText, role = Role.Switch, onValueChange = onLargeText),
                headlineContent = { Text("Chữ lớn trong CookMate") },
                supportingContent = { Text("Tăng cỡ chữ thêm 15% so với cài đặt thiết bị.") },
                trailingContent = { Switch(largeText, onCheckedChange = null) },
            )
        }
        Text("Thông tin ứng dụng", style = MaterialTheme.typography.titleLarge)
        Text(version?.let { "CookMate · Phiên bản $it" } ?: "CookMate")
        Text("Dữ liệu mẫu được lưu trong phiên hiện tại trên thiết bị.")
        Text(if (guest) "Bạn đang ở chế độ khách." else "Bạn đang dùng tài khoản mẫu.")
        if (guest) {
            OutlinedButton(onClick = onLogin) { Text("Đăng nhập mẫu") }
        } else {
            OutlinedButton(onClick = { confirming = true }) {
                Text("Đăng xuất phiên mẫu", color = MaterialTheme.colorScheme.error)
            }
        }
    }

    if (confirming) AlertDialog(
        onDismissRequest = { confirming = false },
        title = { Text("Đăng xuất phiên mẫu?") },
        text = { Text("Dữ liệu cá nhân của phiên mẫu hiện tại sẽ được đặt lại.") },
        confirmButton = {
            TextButton(onClick = {
                confirming = false
                onSignOut()
            }) { Text("Đăng xuất") }
        },
        dismissButton = { TextButton(onClick = { confirming = false }) { Text("Hủy") } },
    )
}
