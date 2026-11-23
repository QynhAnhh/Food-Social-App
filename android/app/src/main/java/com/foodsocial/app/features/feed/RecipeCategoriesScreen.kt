package com.foodsocial.app.features.feed

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.RecipeHeader
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory

@Composable
internal fun RecipeCategoriesScreen(
    recipes: List<Recipe>,
    onBack: () -> Unit,
    onCategory: (RecipeCategory) -> Unit,
) {
    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(16.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        item { RecipeHeader("Danh mục món ăn", onBack) }
        items(RecipeCategory.entries, key = { it.name }) { category ->
            Card(
                onClick = { onCategory(category) },
                colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
            ) {
                ListItem(
                    headlineContent = { Text(category.label) },
                    supportingContent = { Text("${recipes.count { it.category == category }} công thức") },
                    trailingContent = { Text("›") },
                    colors = ListItemDefaults.colors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
                )
            }
        }
    }
}
