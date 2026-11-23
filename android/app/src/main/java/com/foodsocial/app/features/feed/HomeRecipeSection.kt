package com.foodsocial.app.features.feed

import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeDifficulty

internal enum class HomeRecipeSection(val title: String) {
    Recommended("Món ăn đề xuất"),
    Popular("Món Việt phổ biến"),
    Easy("Món dễ nấu"),
    Quick("Món dưới 30 phút"),
    Discover("Khám phá thêm");

    fun recipesFrom(recipes: List<Recipe>, following: Boolean): List<Recipe> {
        val feed = if (following) recipes.filter { it.followedAuthor } else recipes
        return when (this) {
            Recommended -> feed
            Popular -> feed.filter { it.id in popularIds }
            Easy -> feed.filter { it.difficulty == RecipeDifficulty.Easy }
            Quick -> feed.filter { it.minutes < 30 }.sortedBy { it.minutes }
            Discover -> feed.asReversed()
        }
    }
}

private val popularIds = setOf(
    "sour-fish-soup", "water-spinach-garlic", "fried-spring-rolls", "braised-pork-eggs",
    "boiled-chicken", "homestyle-beef-pho", "sticky-rice-mung-bean", "sweet-sour-ribs",
    "banana-coconut-dessert", "green-papaya-salad",
)
