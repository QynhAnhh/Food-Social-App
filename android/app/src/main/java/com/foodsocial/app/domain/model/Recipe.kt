package com.foodsocial.app.domain.model

import java.text.Normalizer
import java.util.Locale

internal enum class RecipeCategory(val label: String) {
    StirFry("Món xào"),
    Soup("Canh"),
    Vegetarian("Món chay"),
    Fried("Món chiên"),
    Braised("Món kho"),
    Steamed("Món hấp"),
    Grilled("Món nướng"),
    Boiled("Món luộc"),
    NoodleSoup("Món nước"),
    Breakfast("Ăn sáng"),
    QuickMeal("Ăn nhanh"),
    Family("Món gia đình"),
    Dessert("Tráng miệng"),
    Salad("Gỏi & cuốn"),
}

internal enum class RecipeDifficulty(val label: String) {
    Easy("Dễ"),
    Medium("Vừa"),
    Hard("Khó"),
}

internal data class RecipeIngredient(
    val name: String,
    val amount: String,
    val kcal: Int? = null,
    val fridgeNames: List<String> = listOf(name),
)

internal data class Recipe(
    val id: String,
    val title: String,
    val image: Int? = null,
    val author: String,
    val rating: String? = null,
    val category: RecipeCategory,
    val difficulty: RecipeDifficulty,
    val minutes: Int,
    val servings: Int,
    val ingredients: List<RecipeIngredient>,
    val steps: List<String>,
    val followedAuthor: Boolean = false,
) {
    val kcal: Int? get() = ingredients.mapNotNull { it.kcal }
        .takeIf { it.isNotEmpty() && it.size == ingredients.size }?.sum()

    fun matchesQuery(query: String): Boolean {
        val target = searchableText(query.trim())
        return searchableText(title).contains(target) ||
            ingredients.any { searchableText(it.name).contains(target) }
    }
}

private val accentMarks = Regex("\\p{M}+")

internal fun searchableText(value: String): String =
    Normalizer.normalize(value.lowercase(Locale.ROOT), Normalizer.Form.NFD)
        .replace(accentMarks, "")
        .replace('đ', 'd')
