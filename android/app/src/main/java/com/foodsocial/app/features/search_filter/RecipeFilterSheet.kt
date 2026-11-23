package com.foodsocial.app.features.search_filter

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.CookMateButton
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory
import com.foodsocial.app.domain.model.RecipeDifficulty

internal enum class CookTime(val label: String) {
    Quick("Tối đa 20 phút"),
    Medium("21–30 phút"),
    Long("Trên 30 phút");

    fun matches(minutes: Int) = when (this) {
        Quick -> minutes <= 20
        Medium -> minutes in 21..30
        Long -> minutes > 30
    }
}

internal data class RecipeFilters(
    val category: RecipeCategory? = null,
    val time: CookTime? = null,
    val difficulty: RecipeDifficulty? = null,
) {
    fun matches(recipe: Recipe): Boolean =
        (category == null || recipe.category == category) &&
            (time == null || time.matches(recipe.minutes)) &&
            (difficulty == null || recipe.difficulty == difficulty)
}

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun RecipeFilterSheet(
    filters: RecipeFilters,
    onApply: (RecipeFilters) -> Unit,
    onDismiss: () -> Unit,
) {
    var category by rememberSaveable { mutableStateOf(filters.category) }
    var time by rememberSaveable { mutableStateOf(filters.time) }
    var difficulty by rememberSaveable { mutableStateOf(filters.difficulty) }

    ModalBottomSheet(onDismissRequest = onDismiss) {
        Column(
            modifier = Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text("Lọc công thức", style = MaterialTheme.typography.titleLarge)
            FilterChoices("Danh mục", RecipeCategory.entries, category, { it.label }) { category = it }
            FilterChoices("Thời gian nấu", CookTime.entries, time, { it.label }) { time = it }
            FilterChoices("Độ khó", RecipeDifficulty.entries, difficulty, { it.label }) { difficulty = it }
            TextButton(onClick = {
                category = null
                time = null
                difficulty = null
            }) { Text("Đặt lại bộ lọc") }
            CookMateButton(
                "Áp dụng",
                { onApply(RecipeFilters(category, time, difficulty)) },
                Modifier.fillMaxWidth(),
            )
        }
    }
}

@Composable
private fun <T> FilterChoices(
    title: String,
    options: List<T>,
    selected: T?,
    label: (T) -> String,
    onSelect: (T?) -> Unit,
) {
    Column {
        Text(title, style = MaterialTheme.typography.titleSmall)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            FilterChip(selected == null, { onSelect(null) }, label = { Text("Tất cả") })
            options.forEach { option ->
                FilterChip(selected == option, { onSelect(option) }, label = { Text(label(option)) })
            }
        }
    }
}
