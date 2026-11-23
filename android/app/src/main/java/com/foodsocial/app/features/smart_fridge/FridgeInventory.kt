package com.foodsocial.app.features.smart_fridge

import android.os.Bundle
import androidx.compose.runtime.saveable.Saver
import com.foodsocial.app.domain.model.Ingredient
import com.foodsocial.app.domain.model.IngredientCategory

internal data class FridgeInventory(
    val ingredients: List<Ingredient> = emptyList(),
    val selectedIds: Set<String> = emptySet(),
) {
    val selected: List<Ingredient> get() = ingredients.filter { it.id in selectedIds }

    fun toggle(ingredient: Ingredient): FridgeInventory = copy(
        selectedIds = if (ingredient.id in selectedIds) selectedIds - ingredient.id else selectedIds + ingredient.id,
    )

    fun upsert(ingredient: Ingredient): FridgeInventory = copy(
        ingredients = if (ingredients.any { it.id == ingredient.id }) {
            ingredients.map { if (it.id == ingredient.id) ingredient else it }
        } else {
            ingredients + ingredient
        },
    )

    fun remove(ingredient: Ingredient): FridgeInventory = copy(
        ingredients = ingredients.filterNot { it.id == ingredient.id },
        selectedIds = selectedIds - ingredient.id,
    )

    companion object {
        val saver = Saver<FridgeInventory, Bundle>(
            save = { inventory ->
                Bundle().apply {
                    putStringArrayList("ingredients", ArrayList(inventory.ingredients.flatMap {
                        listOf(it.id, it.name, it.category.name)
                    }))
                    putStringArrayList("selected", ArrayList(inventory.selectedIds))
                }
            },
            restore = { saved ->
                FridgeInventory(
                    ingredients = saved.getStringArrayList("ingredients").orEmpty().chunked(3).map {
                        val category = IngredientCategory.entries.firstOrNull { category -> category.name == it[2] }
                        Ingredient(it[0], it[1], category ?: IngredientCategory.Other)
                    },
                    selectedIds = saved.getStringArrayList("selected").orEmpty().toSet(),
                )
            },
        )
    }
}
