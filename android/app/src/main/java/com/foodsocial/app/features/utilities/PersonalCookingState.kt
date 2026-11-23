package com.foodsocial.app.features.utilities

import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.setValue
import androidx.lifecycle.ViewModel
import com.foodsocial.app.data.local.sampleRecipes
import com.foodsocial.app.domain.model.*
import com.foodsocial.app.features.recipe_creation.RecipeDraft
import java.util.UUID

internal class PersonalCookingState : ViewModel() {
    var draft by mutableStateOf(RecipeDraft())
    var recipes by mutableStateOf(emptyList<Recipe>())
        private set
    var diary by mutableStateOf(exampleDiary())
        private set
    var shopping by mutableStateOf(emptyList<ShoppingItem>())
        private set

    fun addDiary(recipe: Recipe): Boolean {
        val now = System.currentTimeMillis()
        if (diary.any { it.recipeId == recipe.id && it.cookedAt >= startOfDiaryDay(now = now) }) return false
        diary = listOf(FoodDiaryEntry(UUID.randomUUID().toString(), recipe.id, now)) + diary
        return true
    }

    fun removeDiary(entry: FoodDiaryEntry) {
        diary = diary.filterNot { it.id == entry.id }
    }

    fun addShopping(items: List<ShoppingItem>) {
        shopping = items.fold(shopping) { list, item -> list.addShoppingItem(item) }
    }

    fun saveShopping(item: ShoppingItem) {
        if (shopping.any { it.id == item.id }) {
            val existing = shopping.filterNot { it.id == item.id }
            val merged = existing.addShoppingItem(item)
            shopping = if (merged.size == shopping.size) shopping.map { if (it.id == item.id) item else it } else merged
        } else {
            addShopping(listOf(item))
        }
    }

    fun toggleShopping(item: ShoppingItem) {
        shopping = shopping.map { if (it.id == item.id) it.copy(purchased = !it.purchased) else it }
    }

    fun removeShopping(item: ShoppingItem) {
        shopping = shopping.filterNot { it.id == item.id }
    }

    fun saveRecipe(author: String): Recipe? {
        val recipe = draft.toRecipe("personal-${UUID.randomUUID()}", author) ?: return null
        recipes = listOf(recipe) + recipes
        draft = RecipeDraft()
        return recipe
    }

    fun reset() {
        diary = exampleDiary()
        shopping = emptyList()
        recipes = emptyList()
        draft = RecipeDraft()
    }
}

private fun exampleDiary(): List<FoodDiaryEntry> =
    sampleRecipes.firstOrNull { it.id == "braised-pork-eggs" }?.let {
        listOf(FoodDiaryEntry("sample-diary", it.id, startOfDiaryDay(daysAgo = 10)))
    }.orEmpty()
