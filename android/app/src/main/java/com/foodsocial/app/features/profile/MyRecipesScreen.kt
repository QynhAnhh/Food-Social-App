package com.foodsocial.app.features.profile

import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.lazy.grid.GridItemSpan
import androidx.compose.material3.OutlinedButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import com.foodsocial.app.core.designsystem.*
import com.foodsocial.app.domain.model.Recipe

@Composable
internal fun MyRecipesScreen(
    recipes: List<Recipe>,
    favorites: Set<String>,
    onBack: () -> Unit,
    onCreate: () -> Unit,
    onOpen: (Recipe) -> Unit,
    onToggle: (Recipe) -> Unit,
) {
    RecipeGrid(
        recipes, favorites, onOpen, onToggle,
        header = {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Column {
                    RecipeHeader("Công thức của tôi", onBack)
                    OutlinedButton(onClick = onCreate) { Text("Tạo công thức mới") }
                }
            }
        },
        empty = { RecipeEmpty("Chưa có công thức cá nhân", "Lưu một công thức để xem lại ở đây.") },
    )
}
