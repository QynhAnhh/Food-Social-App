package com.foodsocial.app.features.recipe_detail

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.*
import com.foodsocial.app.domain.model.Recipe

@Composable
internal fun RecipeDetailScreen(
    recipe: Recipe,
    saved: Boolean,
    onBack: () -> Unit,
    onToggleFavorite: () -> Unit,
    onStartCooking: () -> Unit,
    inDiaryToday: Boolean,
    onDiary: () -> Unit,
    onShopping: () -> Unit,
) {
    RecipeOverview(
        recipe = recipe,
        title = "Chi tiết món ăn",
        onBack = onBack,
        favorite = { FavoriteButton(recipe, saved, onToggleFavorite) },
    ) {
        CookMateButton(
            "Bắt đầu nấu",
            onStartCooking,
            Modifier.fillMaxWidth(),
            color = Color(0xFF3DD759),
            textColor = Color.Black,
        )
        CookMateButton(
            if (inDiaryToday) "Xem nhật ký" else "Thêm vào nhật ký",
            onDiary,
            Modifier.fillMaxWidth(),
            color = Color(0xFFFA9D4C),
            textColor = Color.Black,
        )
        OutlinedButton(onClick = onShopping, modifier = Modifier.fillMaxWidth()) {
            Text("Thêm nguyên liệu vào danh sách mua sắm")
        }
    }
}

@Composable
internal fun RecipeOverview(
    recipe: Recipe,
    title: String,
    onBack: () -> Unit,
    favorite: @Composable () -> Unit = {},
    actions: @Composable () -> Unit,
) {
    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(12.dp),
    ) {
        RecipeHeader(title, onBack)
        RecipeImage(recipe, Modifier.fillMaxWidth().heightIn(max = 320.dp).aspectRatio(1.85f))
        Surface(
            color = Color(0xFF8DCEB3),
            shape = MaterialTheme.shapes.medium,
        ) {
            Text(
                recipe.title,
                modifier = Modifier.fillMaxWidth().padding(10.dp),
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.titleLarge,
            )
        }
        Row(
            Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically,
        ) {
            Text(
                "${recipe.minutes} phút · ${recipe.servings} khẩu phần · ${recipe.difficulty.label}",
                modifier = Modifier.weight(1f),
                style = MaterialTheme.typography.bodyMedium,
            )
            favorite()
        }
        recipe.kcal?.let { kcal ->
            Text(
                "Tổng: $kcal kcal",
                modifier = Modifier.fillMaxWidth(),
                textAlign = TextAlign.Center,
                style = MaterialTheme.typography.titleMedium,
            )
        }
        IngredientTable(recipe)
        Text("Các bước nấu", style = MaterialTheme.typography.titleLarge)
        recipe.steps.forEachIndexed { index, step ->
            Text("${index + 1}. $step", style = MaterialTheme.typography.bodyMedium)
        }
        actions()
    }
}

@Composable
private fun IngredientTable(recipe: Recipe) {
    Surface(color = Color(0xFF82C9A9), shape = MaterialTheme.shapes.medium) {
        Column(Modifier.fillMaxWidth().padding(12.dp), verticalArrangement = Arrangement.spacedBy(12.dp)) {
            IngredientRow(
                "Nguyên liệu", "Định lượng",
                if (recipe.ingredients.any { it.kcal != null }) "kcal" else null,
                header = true,
            )
            recipe.ingredients.forEach { ingredient ->
                IngredientRow(ingredient.name, ingredient.amount, ingredient.kcal?.toString())
            }
        }
    }
}

@Composable
private fun IngredientRow(name: String, amount: String, kcal: String?, header: Boolean = false) {
    val style = if (header) MaterialTheme.typography.labelLarge else MaterialTheme.typography.bodyMedium
    Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
        Text(name, Modifier.weight(1.2f), style = style)
        Text(amount, Modifier.weight(1f), style = style)
        if (kcal != null) Text(kcal, Modifier.weight(0.5f), style = style, textAlign = TextAlign.End)
    }
}
