package com.foodsocial.app.features.recipe_creation

import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import com.foodsocial.app.core.designsystem.CookMateButton
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.features.recipe_detail.RecipeOverview

@Composable
internal fun RecipePreviewScreen(recipe: Recipe, onBack: () -> Unit, onSave: () -> Unit) {
    RecipeOverview(recipe, "Xem trước công thức", onBack) {
        CookMateButton("Lưu công thức", onSave, Modifier.fillMaxWidth())
    }
}
