package com.foodsocial.app.domain.model

internal enum class IngredientCategory(val label: String, val glyph: String) {
    Greens("Rau", "🥬"),
    Roots("Củ", "🥕"),
    Fruits("Quả", "🍅"),
    Meat("Thịt", "🥩"),
    Fish("Cá", "🐟"),
    Seafood("Hải sản", "🦐"),
    Eggs("Trứng", "🥚"),
    Dairy("Sữa", "🥛"),
    Mushrooms("Nấm", "🍄"),
    Beans("Đậu", "🫘"),
    Grains("Ngũ cốc", "🌾"),
    Seasoning("Gia vị", "🧂"),
    Other("Khác", "🥣"),
}

internal data class Ingredient(
    val id: String,
    val name: String,
    val category: IngredientCategory,
)

internal fun ingredientKey(name: String): String =
    searchableText(name.trim()).replace(Regex("\\s+"), " ")

internal data class RecipeMatch(
    val recipe: Recipe,
    val available: List<String>,
    val missing: List<String>,
) {
    val coverage: Double get() = available.size.toDouble() / (available.size + missing.size)
}

internal fun recommendRecipes(recipes: List<Recipe>, selected: List<Ingredient>): List<RecipeMatch> {
    val selectedNames = selected.map { ingredientKey(it.name) }.toSet()
    return recipes.mapNotNull { recipe ->
        val ingredients = recipe.ingredients.flatMap { it.fridgeNames }.distinctBy(::ingredientKey)
        val (available, missing) = ingredients.partition { ingredientKey(it) in selectedNames }
        if (available.isEmpty()) null else RecipeMatch(recipe, available, missing)
    }.sortedWith(
        compareByDescending<RecipeMatch> { it.coverage }
            .thenByDescending { it.available.size }
            .thenBy { it.recipe.minutes },
    )
}
