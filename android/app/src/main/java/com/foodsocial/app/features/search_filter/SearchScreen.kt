package com.foodsocial.app.features.search_filter

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.RecipeEmpty
import com.foodsocial.app.core.designsystem.RecipeGrid
import com.foodsocial.app.core.designsystem.RecipeHeader
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory
import com.foodsocial.app.domain.model.RecipeDifficulty

@Composable
internal fun SearchScreen(
    recipes: List<Recipe>,
    favorites: Set<String>,
    initialCategory: RecipeCategory?,
    showFiltersInitially: Boolean,
    onBack: () -> Unit,
    onOpenRecipe: (Recipe) -> Unit,
    onToggleFavorite: (Recipe) -> Unit,
    title: String = initialCategory?.label ?: "Tìm công thức",
) {
    var query by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf(initialCategory) }
    var time by rememberSaveable { mutableStateOf<CookTime?>(null) }
    var difficulty by rememberSaveable { mutableStateOf<RecipeDifficulty?>(null) }
    var showFilters by rememberSaveable { mutableStateOf(showFiltersInitially) }
    val filters = RecipeFilters(category, time, difficulty)
    val results = recipes.filter { filters.matches(it) && it.matchesQuery(query) }

    Column(Modifier.fillMaxSize().imePadding()) {
        Column(Modifier.fillMaxWidth().padding(horizontal = 12.dp)) {
            RecipeHeader(title, onBack)
            Row(verticalAlignment = Alignment.CenterVertically) {
                OutlinedTextField(
                    value = query,
                    onValueChange = { query = it },
                    modifier = Modifier.weight(1f),
                    label = { Text("Tên món hoặc nguyên liệu") },
                    singleLine = true,
                    trailingIcon = {
                        if (query.isNotEmpty()) TextButton(onClick = { query = "" }) { Text("Xóa") }
                    },
                )
                TextButton(onClick = { showFilters = true }) { Text("Lọc") }
            }
        }

        RecipeGrid(
            recipes = results,
            favorites = favorites,
            onOpen = onOpenRecipe,
            onToggleFavorite = onToggleFavorite,
            header = {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    Column(Modifier.padding(top = 8.dp)) {
                        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                            category?.let {
                                InputChip(true, { category = null }, label = { Text("${it.label} ×") })
                            }
                            time?.let {
                                InputChip(true, { time = null }, label = { Text("${it.label} ×") })
                            }
                            difficulty?.let {
                                InputChip(true, { difficulty = null }, label = { Text("Độ khó: ${it.label} ×") })
                            }
                        }
                        Text("${results.size} công thức", style = MaterialTheme.typography.labelLarge)
                    }
                }
            },
            empty = {
                RecipeEmpty("Không tìm thấy công thức", "Thử từ khóa khác hoặc bỏ bớt điều kiện lọc.")
            },
        )
    }

    if (showFilters) {
        RecipeFilterSheet(
            filters = filters,
            onApply = {
                category = it.category
                time = it.time
                difficulty = it.difficulty
                showFilters = false
            },
            onDismiss = { showFilters = false },
        )
    }
}
