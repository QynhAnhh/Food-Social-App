package com.foodsocial.app.features.smart_fridge

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.RecipeEmpty
import com.foodsocial.app.core.designsystem.RecipeHeader
import com.foodsocial.app.domain.model.Ingredient

@Composable
internal fun IngredientManagementScreen(
    ingredients: List<Ingredient>,
    onBack: () -> Unit,
    onSave: (Ingredient) -> Unit,
    onRemove: (Ingredient) -> Unit,
) {
    var editingId by rememberSaveable { mutableStateOf<String?>(null) }
    var removingId by rememberSaveable { mutableStateOf<String?>(null) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            RecipeHeader("Quản lý nguyên liệu", onBack)
            Button(onClick = { editingId = "" }) { Text("Thêm nguyên liệu") }
        }
        if (ingredients.isEmpty()) {
            item { RecipeEmpty("Chưa có nguyên liệu", "Thêm nguyên liệu đầu tiên cho tủ lạnh của bạn.") }
        }
        items(ingredients, key = { it.id }) { ingredient ->
            Card(colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer)) {
                Column(Modifier.fillMaxWidth().padding(horizontal = 12.dp, vertical = 8.dp)) {
                    Text(ingredient.name, style = MaterialTheme.typography.titleMedium)
                    Text(ingredient.category.label, style = MaterialTheme.typography.bodySmall)
                    Row {
                        TextButton(
                            onClick = { editingId = ingredient.id },
                            modifier = Modifier.semantics { contentDescription = "Sửa ${ingredient.name}" },
                        ) { Text("Sửa") }
                        TextButton(
                            onClick = { removingId = ingredient.id },
                            modifier = Modifier.semantics { contentDescription = "Xóa ${ingredient.name}" },
                        ) { Text("Xóa", color = MaterialTheme.colorScheme.error) }
                    }
                }
            }
        }
    }

    editingId?.let { id ->
        val ingredient = ingredients.firstOrNull { it.id == id }
        key(id) {
            IngredientEditorSheet(
                ingredient = ingredient,
                ingredients = ingredients,
                onSave = {
                    editingId = null
                    onSave(it)
                },
                onDismiss = { editingId = null },
            )
        }
    }

    ingredients.firstOrNull { it.id == removingId }?.let { ingredient ->
        AlertDialog(
            onDismissRequest = { removingId = null },
            title = { Text("Xóa nguyên liệu?") },
            text = { Text("Xóa ${ingredient.name} khỏi tủ lạnh và danh sách đang chọn.") },
            confirmButton = {
                TextButton(onClick = {
                    removingId = null
                    onRemove(ingredient)
                }) { Text("Xác nhận xóa", color = MaterialTheme.colorScheme.error) }
            },
            dismissButton = {
                TextButton(onClick = { removingId = null }) { Text("Hủy") }
            },
        )
    }
}
