package com.foodsocial.app.features.smart_fridge

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.*
import com.foodsocial.app.domain.model.Ingredient
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.recommendRecipes

@Composable
internal fun RecipeRecommendationsScreen(
    recipes: List<Recipe>,
    selected: List<Ingredient>,
    favorites: Set<String>,
    onBack: () -> Unit,
    onOpenRecipe: (Recipe) -> Unit,
    onToggleFavorite: (Recipe) -> Unit,
) {
    val matches = remember(recipes, selected) { recommendRecipes(recipes, selected) }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        item {
            RecipeHeader("Món ăn phù hợp", onBack)
            if (selected.isNotEmpty()) {
                Text(
                    "Nguyên liệu đã chọn: ${selected.joinToString { it.name }}",
                    style = MaterialTheme.typography.bodyMedium,
                )
            }
        }
        if (matches.isEmpty()) {
            item {
                if (selected.isEmpty()) {
                    RecipeEmpty("Chưa chọn nguyên liệu", "Quay lại Tủ lạnh để chọn nguyên liệu bạn đang có.")
                } else {
                    RecipeEmpty("Chưa có món phù hợp", "Thử chọn thêm hoặc đổi nguyên liệu để xem gợi ý khác.")
                }
            }
        }
        items(matches, key = { it.recipe.id }) { match ->
            val recipe = match.recipe
            Card(
                onClick = { onOpenRecipe(recipe) },
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
            ) {
                Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Row(verticalAlignment = Alignment.CenterVertically, horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        RecipeImage(recipe, Modifier.size(width = 72.dp, height = 56.dp))
                        Column(Modifier.weight(1f)) {
                            Text(recipe.title, style = MaterialTheme.typography.titleMedium)
                            Text(
                                "Khớp ${match.available.size}/${match.available.size + match.missing.size} nguyên liệu · ${recipe.minutes} phút",
                                style = MaterialTheme.typography.bodySmall,
                            )
                        }
                        FavoriteButton(recipe, recipe.id in favorites) { onToggleFavorite(recipe) }
                    }
                    Text("Đã có: ${match.available.joinToString()}", style = MaterialTheme.typography.bodyMedium)
                    Text(
                        if (match.missing.isEmpty()) "Đã đủ nguyên liệu"
                        else "Còn thiếu: ${match.missing.joinToString()}",
                        style = MaterialTheme.typography.bodyMedium,
                    )
                }
            }
        }
    }
}
