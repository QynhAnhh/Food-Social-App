package com.foodsocial.app.features.shopping_list

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextDecoration
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.*
import com.foodsocial.app.domain.model.ShoppingItem

@Composable
internal fun ShoppingListScreen(
    shopping: List<ShoppingItem>,
    onBack: () -> Unit,
    onSave: (ShoppingItem) -> Unit,
    onToggle: (ShoppingItem) -> Unit,
    onRemove: (ShoppingItem) -> Unit,
) {
    var editId by rememberSaveable { mutableStateOf<String?>(null) }
    var deleteId by rememberSaveable { mutableStateOf<String?>(null) }
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item {
            RecipeHeader("Danh sách mua sắm", onBack)
            CookMateButton("Thêm mục mua sắm", { editId = "" }, Modifier.fillMaxWidth())
        }
        if (shopping.isEmpty()) item {
            RecipeEmpty("Danh sách mua sắm đang trống", "Thêm một mục hoặc lấy nguyên liệu từ công thức và Tủ lạnh.")
        } else {
            item {
                Text("Đã mua ${shopping.count { it.purchased }}/${shopping.size} mục", style = MaterialTheme.typography.labelLarge)
            }
        }

        items(shopping, key = { it.id }) { item ->
            Card(
                modifier = Modifier.fillMaxWidth(),
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
            ) {
                Row(Modifier.padding(horizontal = 8.dp), verticalAlignment = Alignment.CenterVertically) {
                    Checkbox(
                        checked = item.purchased,
                        onCheckedChange = { onToggle(item) },
                        modifier = Modifier.semantics { contentDescription = "Đã mua ${item.name}" },
                    )
                    Column(Modifier.weight(1f)) {
                        Text(
                            item.name,
                            style = MaterialTheme.typography.titleMedium,
                            textDecoration = if (item.purchased) TextDecoration.LineThrough else null,
                        )
                        Text(item.amountLabel.ifBlank { "Không ghi định lượng" }, style = MaterialTheme.typography.bodySmall)
                    }
                }
                Row(Modifier.padding(horizontal = 8.dp)) {
                    TextButton(
                        onClick = { editId = item.id },
                        modifier = Modifier.semantics { contentDescription = "Sửa ${item.name}" },
                    ) { Text("Sửa") }
                    TextButton(
                        onClick = { deleteId = item.id },
                        modifier = Modifier.semantics { contentDescription = "Xóa ${item.name}" },
                    ) { Text("Xóa", color = MaterialTheme.colorScheme.error) }
                }
            }
        }
    }

    editId?.let { id ->
        key(id) {
            ShoppingItemEditorSheet(
                item = shopping.firstOrNull { it.id == id },
                onSave = {
                    editId = null
                    onSave(it)
                },
                onDismiss = { editId = null },
            )
        }
    }

    shopping.firstOrNull { it.id == deleteId }?.let { item ->
        AlertDialog(
            onDismissRequest = { deleteId = null },
            title = { Text("Xóa mục mua sắm?") },
            text = { Text("Xóa ${item.name} khỏi danh sách mua sắm.") },
            confirmButton = {
                TextButton(onClick = {
                    deleteId = null
                    onRemove(item)
                }) { Text("Xác nhận xóa") }
            },
            dismissButton = { TextButton(onClick = { deleteId = null }) { Text("Hủy") } },
        )
    }
}
