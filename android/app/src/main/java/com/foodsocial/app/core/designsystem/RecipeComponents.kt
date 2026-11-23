package com.foodsocial.app.core.designsystem

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.semantics.selected
import androidx.compose.ui.unit.dp
import com.foodsocial.app.domain.model.Recipe

@Composable
internal fun RecipeHeader(title: String, onBack: () -> Unit) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        TextButton(onClick = onBack) { Text("‹ Quay lại") }
        Text(title, style = MaterialTheme.typography.titleLarge)
    }
}

@Composable
internal fun RecipeImage(recipe: Recipe, modifier: Modifier = Modifier) {
    val artwork = recipe.image
    if (artwork == null) {
        SamplePhotoPlaceholder("🍽", "Chưa có ảnh món ăn", modifier)
        return
    }
    Image(
        painter = painterResource(artwork),
        contentDescription = "Ảnh ${recipe.title}",
        modifier = modifier.clip(MaterialTheme.shapes.medium),
        contentScale = ContentScale.Inside,
    )
}

@Composable
internal fun SamplePhotoPlaceholder(symbol: String, label: String, modifier: Modifier = Modifier) {
    Surface(
        modifier = modifier.semantics(mergeDescendants = true) { contentDescription = label },
        shape = MaterialTheme.shapes.medium,
        color = MaterialTheme.colorScheme.primaryContainer,
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(symbol, style = MaterialTheme.typography.headlineSmall)
        }
    }
}

@Composable
internal fun FavoriteButton(recipe: Recipe, saved: Boolean, onToggle: () -> Unit) {
    val label = if (saved) "Bỏ lưu ${recipe.title}" else "Lưu ${recipe.title}"
    IconButton(
        onClick = onToggle,
        modifier = Modifier.semantics {
            contentDescription = label
            selected = saved
        },
    ) {
        Text(
            if (saved) "♥" else "♡",
            color = if (saved) BrandRed else MaterialTheme.colorScheme.primary,
            style = MaterialTheme.typography.headlineSmall,
        )
    }
}

@Composable
internal fun RecipeGrid(
    recipes: List<Recipe>,
    favorites: Set<String>,
    onOpen: (Recipe) -> Unit,
    onToggleFavorite: (Recipe) -> Unit,
    header: LazyGridScope.() -> Unit,
    empty: @Composable () -> Unit,
) {
    LazyVerticalGrid(
        columns = GridCells.Adaptive(minSize = 144.dp),
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(start = 12.dp, end = 12.dp, bottom = 16.dp),
        horizontalArrangement = Arrangement.spacedBy(8.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        header()
        if (recipes.isEmpty()) {
            item(span = { GridItemSpan(maxLineSpan) }) { empty() }
        }
        items(recipes, key = { it.id }) { recipe ->
            RecipeCard(recipe, recipe.id in favorites, { onOpen(recipe) }, { onToggleFavorite(recipe) })
        }
    }
}

@Composable
internal fun RecipeCard(
    recipe: Recipe,
    saved: Boolean,
    onOpen: () -> Unit,
    onToggleFavorite: () -> Unit,
    modifier: Modifier = Modifier,
) {
    Card(
        onClick = onOpen,
        modifier = modifier,
        colors = CardDefaults.cardColors(containerColor = MaterialTheme.colorScheme.secondaryContainer),
    ) {
        Column(Modifier.padding(8.dp), verticalArrangement = Arrangement.spacedBy(4.dp)) {
            RecipeImage(recipe, Modifier.fillMaxWidth().aspectRatio(1.35f))
            Text(recipe.title, style = MaterialTheme.typography.titleSmall)
            Text(recipe.author, style = MaterialTheme.typography.bodySmall)
            val rating = recipe.rating?.let { "★ $it · " }.orEmpty()
            Text("$rating${recipe.minutes} phút", style = MaterialTheme.typography.bodySmall)
            Text("Độ khó: ${recipe.difficulty.label}", style = MaterialTheme.typography.bodySmall)
            Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                Text(
                    recipe.category.label,
                    modifier = Modifier.weight(1f),
                    color = MaterialTheme.colorScheme.primary,
                    style = MaterialTheme.typography.labelMedium,
                )
                FavoriteButton(recipe, saved, onToggleFavorite)
            }
        }
    }
}

@Composable
internal fun RecipeEmpty(title: String, message: String) {
    Column(
        Modifier.fillMaxWidth().padding(vertical = 36.dp, horizontal = 12.dp),
        verticalArrangement = Arrangement.spacedBy(8.dp),
    ) {
        Text(title, style = MaterialTheme.typography.titleLarge)
        Text(message, style = MaterialTheme.typography.bodyMedium)
    }
}
