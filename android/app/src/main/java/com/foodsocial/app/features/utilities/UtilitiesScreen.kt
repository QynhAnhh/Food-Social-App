package com.foodsocial.app.features.utilities

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

@Composable
internal fun UtilitiesScreen(onDiary: () -> Unit, onShopping: () -> Unit) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        Text("Tiện ích", style = MaterialTheme.typography.headlineSmall)
        UtilityCard("Nhật ký món ăn", "Xem lại những món bạn đã ghi vào nhật ký.", onDiary)
        UtilityCard("Danh sách mua sắm", "Quản lý nguyên liệu cần mua.", onShopping)
    }
}

@Composable
private fun UtilityCard(title: String, description: String, onClick: () -> Unit) {
    Card(
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
    ) {
        ListItem(
            headlineContent = { Text(title, style = MaterialTheme.typography.titleMedium) },
            supportingContent = { Text(description) },
            trailingContent = { Text("›") },
            colors = ListItemDefaults.colors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
        )
    }
}
