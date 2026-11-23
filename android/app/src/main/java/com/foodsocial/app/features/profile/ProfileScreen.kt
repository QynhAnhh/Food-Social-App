package com.foodsocial.app.features.profile

import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.Role
import androidx.compose.ui.unit.dp

@Composable
internal fun ProfileScreen(
    displayName: String,
    guest: Boolean,
    avatar: SampleAvatar,
    favoriteCount: Int,
    recipeCount: Int,
    unreadCount: Int,
    onEdit: () -> Unit,
    onRecipes: () -> Unit,
    onFavorites: () -> Unit,
    onNotifications: () -> Unit,
    onSettings: () -> Unit,
    onLogin: () -> Unit,
) {
    var showingCredits by rememberSaveable { mutableStateOf(false) }
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        Text("Hồ sơ", style = MaterialTheme.typography.headlineSmall)
        Surface(
            modifier = Modifier.fillMaxWidth(),
            color = MaterialTheme.colorScheme.primaryContainer,
            contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
            shape = MaterialTheme.shapes.large,
        ) {
            Column(Modifier.padding(16.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(12.dp)) {
                    ProfileAvatar(avatar)
                    Column(Modifier.weight(1f)) {
                        Text(displayName, style = MaterialTheme.typography.titleLarge)
                        Text(if (guest) "Phiên khách" else "Tài khoản mẫu", style = MaterialTheme.typography.bodyMedium)
                    }
                }
                OutlinedButton(onClick = onEdit) { Text("Chỉnh sửa hồ sơ") }
            }
        }
        Column {
            ProfileLink("Công thức của tôi", "$recipeCount công thức", onRecipes)
            HorizontalDivider()
            ProfileLink("Món yêu thích", "$favoriteCount món đã lưu", onFavorites)
            HorizontalDivider()
            ProfileLink("Thông báo", if (unreadCount == 0) "Đã đọc tất cả" else "$unreadCount chưa đọc", onNotifications)
            HorizontalDivider()
            ProfileLink("Cài đặt", "Giao diện và phiên sử dụng", onSettings)
        }
        if (guest) OutlinedButton(onClick = onLogin) { Text("Đăng nhập mẫu") }
        TextButton(onClick = { showingCredits = true }) { Text("Nguồn ảnh mẫu") }
    }
    if (showingCredits) SamplePhotoCredits(onDismiss = { showingCredits = false })
}

@Composable
private fun ProfileLink(title: String, subtitle: String, onClick: () -> Unit) {
    ListItem(
        modifier = Modifier.clickable(role = Role.Button, onClick = onClick),
        headlineContent = { Text(title, style = MaterialTheme.typography.titleMedium) },
        supportingContent = { Text(subtitle) },
        trailingContent = { Text("›") },
    )
}
