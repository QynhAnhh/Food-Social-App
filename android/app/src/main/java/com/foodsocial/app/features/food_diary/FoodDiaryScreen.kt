package com.foodsocial.app.features.food_diary

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.selection.selectableGroup
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.*
import com.foodsocial.app.domain.model.FoodDiaryEntry
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.startOfDiaryDay
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

@Composable
internal fun FoodDiaryScreen(
    entries: List<FoodDiaryEntry>,
    recipes: Map<String, Recipe>,
    onBack: () -> Unit,
    onOpen: (Recipe) -> Unit,
    onRemove: (FoodDiaryEntry) -> Unit,
    initialEntryId: String? = null,
) {
    val recentCutoff = startOfDiaryDay(daysAgo = 6)
    var tab by rememberSaveable(initialEntryId) {
        val isEarlier = entries.any { it.id == initialEntryId && it.cookedAt < recentCutoff }
        mutableIntStateOf(if (isEarlier) 1 else 0)
    }
    var deletingId by rememberSaveable { mutableStateOf<String?>(null) }
    val visible = entries.filter { (it.cookedAt >= recentCutoff) == (tab == 0) }
        .sortedByDescending { it.cookedAt }
    val dateFormat = remember { SimpleDateFormat("dd/MM/yyyy", Locale.forLanguageTag("vi-VN")) }

    Column(Modifier.fillMaxSize()) {
        Surface(color = Color(0xFF5CF6AB)) {
            Box(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 4.dp)) {
                RecipeHeader("Nhật ký món ăn", onBack)
            }
        }
        Surface(
            modifier = Modifier.fillMaxWidth().padding(horizontal = 20.dp, vertical = 8.dp),
            shape = CircleShape,
            color = Color(0xFFE6E8E6),
        ) {
            Row(Modifier.selectableGroup()) {
                listOf("Gần đây", "Trước đó").forEachIndexed { index, label ->
                    Surface(
                        selected = tab == index,
                        onClick = { tab = index },
                        modifier = Modifier.weight(1f).heightIn(min = 48.dp),
                        shape = CircleShape,
                        color = if (tab == index) Color(0xFF3DD468) else Color.Transparent,
                    ) {
                        Box(contentAlignment = Alignment.Center) {
                            Text(label, Modifier.padding(8.dp), textAlign = TextAlign.Center,
                                style = MaterialTheme.typography.labelLarge, color = Color(0xFF142A19))
                        }
                    }
                }
            }
        }
        LazyColumn(
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(12.dp),
            verticalArrangement = Arrangement.spacedBy(10.dp),
        ) {
            if (visible.isEmpty()) item {
                if (tab == 0) {
                    RecipeEmpty("Chưa có món trong 7 ngày gần đây", "Thêm món vào nhật ký từ màn Chi tiết món ăn.")
                } else {
                    RecipeEmpty("Chưa có món trước đó", "Món nấu từ 7 ngày trước trở về trước sẽ xuất hiện ở đây.")
                }
            }
            items(visible, key = { it.id }) { entry ->
                val recipe = recipes[entry.recipeId]
                Card(
                    modifier = Modifier.fillMaxWidth(),
                    colors = CardDefaults.cardColors(containerColor = Color(0xFFB6CFC7)),
                ) {
                    Row(
                        modifier = Modifier.padding(10.dp),
                        horizontalArrangement = Arrangement.spacedBy(10.dp),
                        verticalAlignment = Alignment.CenterVertically,
                    ) {
                        if (recipe != null) RecipeImage(recipe, Modifier.size(width = 92.dp, height = 78.dp))
                        Column(Modifier.weight(1f)) {
                            Text(recipe?.title ?: "Công thức không còn khả dụng", style = MaterialTheme.typography.titleSmall)
                            Text("Ngày nấu: ${dateFormat.format(Date(entry.cookedAt))}", style = MaterialTheme.typography.bodySmall)
                            recipe?.let {
                                Text("${it.minutes} phút · ${it.difficulty.label} · ${it.servings} khẩu phần", style = MaterialTheme.typography.bodySmall)
                            }
                        }
                    }
                    FlowRow(Modifier.padding(horizontal = 4.dp), horizontalArrangement = Arrangement.spacedBy(4.dp)) {
                        if (recipe != null) TextButton(onClick = { onOpen(recipe) }) { Text("Xem công thức") }
                        TextButton(
                            onClick = { deletingId = entry.id },
                            modifier = Modifier.semantics {
                                contentDescription = "Xóa nhật ký ${recipe?.title.orEmpty()}".trimEnd()
                            },
                        ) { Text("Xóa", color = MaterialTheme.colorScheme.error) }
                    }
                }
            }
        }
    }

    entries.firstOrNull { it.id == deletingId }?.let { entry ->
        AlertDialog(
            onDismissRequest = { deletingId = null },
            title = { Text("Xóa mục nhật ký?") },
            text = { Text("Mục đã chọn sẽ được gỡ khỏi nhật ký món ăn.") },
            confirmButton = {
                TextButton(onClick = {
                    deletingId = null
                    onRemove(entry)
                }) { Text("Xác nhận xóa") }
            },
            dismissButton = { TextButton(onClick = { deletingId = null }) { Text("Hủy") } },
        )
    }
}
