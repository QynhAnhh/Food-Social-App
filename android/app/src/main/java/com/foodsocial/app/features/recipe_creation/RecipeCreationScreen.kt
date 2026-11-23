package com.foodsocial.app.features.recipe_creation

import androidx.activity.compose.BackHandler
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.itemsIndexed
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.*
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory
import com.foodsocial.app.domain.model.RecipeDifficulty
import com.foodsocial.app.domain.model.RecipeIngredient

@Composable
internal fun RecipeCreationScreen(
    draft: RecipeDraft,
    photoChoices: List<Recipe>,
    onChange: (RecipeDraft) -> Unit,
    onBack: () -> Unit,
    onPreview: () -> Unit,
) {
    var submitted by rememberSaveable { mutableStateOf(false) }
    BackHandler(onBack = onBack)

    LazyColumn(
        modifier = Modifier.fillMaxSize().imePadding(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item("head") {
            RecipeHeader("Tạo công thức", onBack)
            Column(verticalArrangement = Arrangement.spacedBy(12.dp)) {
                RecipeField("Tên món", draft.title, { onChange(draft.copy(title = it)) },
                    error = "Vui lòng nhập tên món.".takeIf { submitted && draft.title.isBlank() })
                FormChoice("Danh mục", draft.category, RecipeCategory.entries, { it.label }) {
                    onChange(draft.copy(category = it))
                }
                FormChoice("Độ khó", draft.difficulty, RecipeDifficulty.entries, { it.label }) {
                    onChange(draft.copy(difficulty = it))
                }
                RecipeField(
                    "Thời gian nấu (phút)", draft.minutes, { onChange(draft.copy(minutes = it)) },
                    error = "Nhập số phút từ 1 đến 1440.".takeIf { submitted && draft.validMinutes == null },
                    numeric = true,
                )
                RecipeField(
                    "Khẩu phần", draft.servings, { onChange(draft.copy(servings = it)) },
                    error = "Nhập số khẩu phần từ 1 đến 100.".takeIf { submitted && draft.validServings == null },
                    numeric = true,
                )
            }
        }
        item("artwork") {
            Text("Ảnh công thức", style = MaterialTheme.typography.titleMedium)
            val images = photoChoices.filter { it.image != null }.distinctBy { it.image }
            FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                FilterChip(draft.image == null, { onChange(draft.copy(image = null)) }, label = { Text("Hình giữ chỗ") })
                images.forEach { example ->
                    FilterChip(
                        draft.image == example.image,
                        { onChange(draft.copy(image = example.image)) },
                        label = { Text("Ảnh mẫu: ${example.title}") },
                    )
                }
            }
            images.firstOrNull { it.image == draft.image }?.let {
                RecipeImage(it, Modifier.width(160.dp).height(100.dp))
            }
        }
        item("ingredients-title") {
            Text("Nguyên liệu", style = MaterialTheme.typography.titleLarge)
            if (submitted && draft.ingredients.isEmpty()) {
                FormError("Thêm ít nhất một nguyên liệu.")
            }
        }
        itemsIndexed(draft.ingredients) { index, ingredient ->
            Surface(shape = MaterialTheme.shapes.medium, color = MaterialTheme.colorScheme.secondaryContainer) {
                Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    RecipeField("Nguyên liệu ${index + 1}", ingredient.name, { name ->
                        onChange(draft.copy(ingredients = draft.ingredients.replacing(index, ingredient.copy(name = name))))
                    }, error = "Vui lòng nhập tên nguyên liệu.".takeIf { submitted && ingredient.name.isBlank() })
                    RecipeField("Định lượng ${index + 1}", ingredient.amount, { amount ->
                        onChange(draft.copy(ingredients = draft.ingredients.replacing(index, ingredient.copy(amount = amount))))
                    }, error = "Vui lòng nhập định lượng.".takeIf { submitted && ingredient.amount.isBlank() })
                    TextButton(onClick = {
                        onChange(draft.copy(ingredients = draft.ingredients.filterIndexed { i, _ -> i != index }))
                    }) { Text("Xóa nguyên liệu ${index + 1}") }
                }
            }
        }
        item("add-ingredient") {
            OutlinedButton(onClick = { onChange(draft.copy(ingredients = draft.ingredients + RecipeIngredient("", ""))) }) {
                Text("Thêm nguyên liệu")
            }
        }
        item("steps-title") {
            Text("Các bước nấu", style = MaterialTheme.typography.titleLarge)
            if (submitted && draft.steps.isEmpty()) FormError("Thêm ít nhất một bước nấu.")
        }
        itemsIndexed(draft.steps) { index, step ->
            Column {
                RecipeField("Bước ${index + 1}", step, {
                    onChange(draft.copy(steps = draft.steps.replacing(index, it)))
                }, error = "Vui lòng nhập nội dung bước nấu.".takeIf { submitted && step.isBlank() }, singleLine = false)
                TextButton(onClick = {
                    onChange(draft.copy(steps = draft.steps.filterIndexed { i, _ -> i != index }))
                }) { Text("Xóa bước ${index + 1}") }
            }
        }
        item("submit") {
            Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(onClick = { onChange(draft.copy(steps = draft.steps + "")) }) { Text("Thêm bước nấu") }
                if (submitted && !draft.isValid) FormError("Kiểm tra các trường còn trống hoặc sai định dạng.")
                CookMateButton(
                    "Xem trước",
                    {
                        submitted = true
                        if (draft.isValid) onPreview()
                    },
                    Modifier.fillMaxWidth(),
                )
            }
        }
    }
}

@Composable
private fun RecipeField(
    label: String,
    value: String,
    onChange: (String) -> Unit,
    error: String? = null,
    numeric: Boolean = false,
    singleLine: Boolean = true,
) {
    OutlinedTextField(
        value, onChange, Modifier.fillMaxWidth(),
        label = { Text(label) },
        singleLine = singleLine,
        minLines = if (singleLine) 1 else 2,
        isError = error != null,
        supportingText = { if (error != null) Text(error) },
        keyboardOptions = KeyboardOptions(keyboardType = if (numeric) KeyboardType.Number else KeyboardType.Text),
    )
}

@Composable
private fun FormError(message: String) = Text(message, color = MaterialTheme.colorScheme.error)

@Composable
private fun <T> FormChoice(title: String, value: T, options: List<T>, label: (T) -> String, onSelect: (T) -> Unit) {
    var expanded by remember { mutableStateOf(false) }
    Box {
        OutlinedButton(onClick = { expanded = true }, modifier = Modifier.fillMaxWidth()) {
            Text("$title: ${label(value)} ▾")
        }
        DropdownMenu(expanded = expanded, onDismissRequest = { expanded = false }) {
            options.forEach {
                DropdownMenuItem(text = { Text(label(it)) }, onClick = {
                    expanded = false
                    onSelect(it)
                })
            }
        }
    }
}

private fun <T> List<T>.replacing(index: Int, value: T): List<T> =
    mapIndexed { i, current -> if (i == index) value else current }
