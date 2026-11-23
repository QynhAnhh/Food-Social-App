package com.foodsocial.app.features.recipe_creation

import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory
import com.foodsocial.app.domain.model.RecipeDifficulty
import com.foodsocial.app.domain.model.RecipeIngredient

internal data class RecipeDraft(
    val title: String = "",
    val category: RecipeCategory = RecipeCategory.Family,
    val minutes: String = "",
    val servings: String = "",
    val difficulty: RecipeDifficulty = RecipeDifficulty.Easy,
    val image: Int? = null,
    val ingredients: List<RecipeIngredient> = emptyList(),
    val steps: List<String> = emptyList(),
) {
    val isDirty: Boolean get() = this != RecipeDraft()
    val validMinutes: Int? get() = minutes.trim().toIntOrNull()?.takeIf { it in 1..1440 }
    val validServings: Int? get() = servings.trim().toIntOrNull()?.takeIf { it in 1..100 }
    val validIngredients: Boolean get() = ingredients.isNotEmpty() && ingredients.all {
        it.name.isNotBlank() && it.amount.isNotBlank()
    }
    val validSteps: Boolean get() = steps.isNotEmpty() && steps.all(String::isNotBlank)
    val isValid: Boolean get() = title.isNotBlank() && validMinutes != null &&
        validServings != null && validIngredients && validSteps

    fun toRecipe(id: String, author: String): Recipe? {
        if (!isValid) return null
        return Recipe(
            id = id,
            title = title.trim(),
            category = category,
            minutes = checkNotNull(validMinutes),
            servings = checkNotNull(validServings),
            difficulty = difficulty,
            image = image,
            author = author,
            ingredients = ingredients.map { RecipeIngredient(it.name.trim(), it.amount.trim()) },
            steps = steps.map(String::trim),
        )
    }
}
