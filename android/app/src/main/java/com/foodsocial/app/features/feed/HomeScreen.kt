package com.foodsocial.app.features.feed

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.foodsocial.app.R
import com.foodsocial.app.core.designsystem.*
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory
import kotlinx.coroutines.delay

@Composable
internal fun HomeScreen(
    displayName: String?,
    recipes: List<Recipe>,
    favorites: Set<String>,
    onOpenFridge: () -> Unit,
    onSearch: () -> Unit,
    onFilter: () -> Unit,
    onCategories: () -> Unit,
    onCategory: (RecipeCategory) -> Unit,
    onSection: (HomeRecipeSection, Boolean) -> Unit,
    onOpenRecipe: (Recipe) -> Unit,
    onToggleFavorite: (Recipe) -> Unit,
) {
    var tab by rememberSaveable { mutableIntStateOf(1) }
    var loaded by rememberSaveable { mutableStateOf(false) }
    val following = tab == 0
    val sections = remember(recipes, following) {
        HomeRecipeSection.entries.map { it to it.recipesFrom(recipes, following) }.filter { it.second.isNotEmpty() }
    }
    LaunchedEffect(Unit) {
        if (!loaded) {
            delay(250)
            loaded = true
        }
    }

    LazyColumn(
        modifier = Modifier.fillMaxSize(),
        contentPadding = PaddingValues(horizontal = 12.dp, vertical = 8.dp),
        verticalArrangement = Arrangement.spacedBy(16.dp),
    ) {
        item(key = "header") {
            Column(verticalArrangement = Arrangement.spacedBy(4.dp)) {
                Row(verticalAlignment = Alignment.CenterVertically) {
                    CookMateArtwork(R.drawable.cookmate_logo, Modifier.size(36.dp))
                    OutlinedButton(onClick = onSearch, modifier = Modifier.weight(1f).padding(start = 8.dp)) {
                        Text("Tìm món hoặc nguyên liệu")
                    }
                    TextButton(onClick = onFilter) { Text("Lọc") }
                }
                Text(
                    displayName?.let { "Chào, $it!" } ?: "Bạn đang dùng CookMate ở chế độ khách.",
                    modifier = Modifier.padding(horizontal = 4.dp),
                    style = MaterialTheme.typography.bodyMedium,
                )
                Row {
                    TextButton(onClick = onCategories) { Text("Danh mục") }
                    TextButton(onClick = onOpenFridge) { Text("Mở Tủ lạnh") }
                }
                LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(RecipeCategory.entries, key = { it.name }) { category ->
                        SuggestionChip(onClick = { onCategory(category) }, label = { Text(category.label) })
                    }
                }
                PrimaryTabRow(selectedTabIndex = tab) {
                    Tab(following, onClick = { tab = 0 }, text = { Text("Đang theo dõi") })
                    Tab(!following, onClick = { tab = 1 }, text = { Text("Đề xuất") })
                }
            }
        }

        if (!loaded) {
            item(key = "loading") { LinearProgressIndicator(Modifier.fillMaxWidth()) }
        } else if (sections.isEmpty()) {
            item(key = "empty") {
                if (following) {
                    RecipeEmpty("Chưa có món từ tác giả đang theo dõi", "Bạn có thể khám phá các món trong tab Đề xuất.")
                } else {
                    RecipeEmpty("Chưa có công thức đề xuất", "Các công thức sẽ xuất hiện ở đây khi có dữ liệu.")
                }
            }
        } else {
            items(sections, key = { it.first.name }) { (section, sectionRecipes) ->
                Column {
                    Row(Modifier.fillMaxWidth(), verticalAlignment = Alignment.CenterVertically) {
                        Text(section.title, Modifier.weight(1f), style = MaterialTheme.typography.titleLarge)
                        TextButton(
                            onClick = { onSection(section, following) },
                            modifier = Modifier.semantics { contentDescription = "Xem tất cả ${section.title}" },
                        ) { Text("Xem tất cả") }
                    }
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(10.dp)) {
                        items(sectionRecipes.take(8), key = { it.id }) { recipe ->
                            RecipeCard(
                                recipe = recipe,
                                saved = recipe.id in favorites,
                                onOpen = { onOpenRecipe(recipe) },
                                onToggleFavorite = { onToggleFavorite(recipe) },
                                modifier = Modifier.width(168.dp),
                            )
                        }
                    }
                }
            }
        }
    }
}
