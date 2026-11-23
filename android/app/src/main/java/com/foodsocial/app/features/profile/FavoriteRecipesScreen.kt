package com.foodsocial.app.features.profile

import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.runtime.Composable
import com.foodsocial.app.core.designsystem.RecipeEmpty
import com.foodsocial.app.core.designsystem.RecipeGrid
import com.foodsocial.app.core.designsystem.RecipeHeader
import com.foodsocial.app.domain.model.Recipe

@Composable
internal fun FavoriteRecipesScreen(
    recipes: List<Recipe>,
    favorites: Set<String>,
    onBack: () -> Unit,
    onOpenRecipe: (Recipe) -> Unit,
    onToggleFavorite: (Recipe) -> Unit,
) {
    RecipeGrid(
        recipes = recipes.filter { it.id in favorites },
        favorites = favorites,
        onOpen = onOpenRecipe,
        onToggleFavorite = onToggleFavorite,
        header = {
            item(span = { GridItemSpan(maxLineSpan) }) {
                RecipeHeader("Món yêu thích", onBack)
            }
        },
        empty = { RecipeEmpty("Bạn chưa lưu món nào", "Bấm biểu tượng trái tim trên công thức để lưu món.") },
    )
}
