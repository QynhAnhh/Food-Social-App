package com.foodsocial.app.features.smart_fridge

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.CookMateButton
import com.foodsocial.app.domain.model.Ingredient
import com.foodsocial.app.domain.model.IngredientCategory
import com.foodsocial.app.domain.model.ingredientKey
import java.util.UUID

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun IngredientEditorSheet(
    ingredient: Ingredient?,
    ingredients: List<Ingredient>,
    onSave: (Ingredient) -> Unit,
    onDismiss: () -> Unit,
) {
    var name by rememberSaveable { mutableStateOf(ingredient?.name.orEmpty()) }
    var category by rememberSaveable { mutableStateOf(ingredient?.category ?: IngredientCategory.Greens) }
    var submitted by rememberSaveable { mutableStateOf(false) }
    val normalizedName = ingredientKey(name)
    val error = when {
        name.isBlank() -> "Vui lòng nhập tên nguyên liệu."
        ingredients.any { it.id != ingredient?.id && ingredientKey(it.name) == normalizedName } ->
            "Tên nguyên liệu đã có trong tủ lạnh."
        else -> null
    }

    ModalBottomSheet(
        onDismissRequest = onDismiss,
        sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true),
    ) {
        Column(
            Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(
                if (ingredient == null) "Thêm nguyên liệu" else "Sửa nguyên liệu",
                style = MaterialTheme.typography.titleLarge,
            )
            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Tên nguyên liệu") },
                modifier = Modifier.fillMaxWidth(),
                singleLine = true,
                isError = submitted && error != null,
                supportingText = { if (submitted && error != null) Text(error) },
            )
            Text("Danh mục", style = MaterialTheme.typography.titleSmall)
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                IngredientCategory.entries.forEach { option ->
                    FilterChip(category == option, { category = option }, label = { Text(option.label) })
                }
            }
            CookMateButton(
                label = "Lưu nguyên liệu",
                onClick = {
                    submitted = true
                    if (error == null) {
                        onSave(Ingredient(ingredient?.id ?: UUID.randomUUID().toString(), name.trim(), category))
                    }
                },
                modifier = Modifier.fillMaxWidth(),
            )
        }
    }
}
