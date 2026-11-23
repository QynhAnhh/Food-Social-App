package com.foodsocial.app.features.smart_fridge

import androidx.compose.foundation.Image
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.lazy.grid.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.layout.ContentScale
import androidx.compose.ui.res.painterResource
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.foodsocial.app.R
import com.foodsocial.app.core.designsystem.RecipeEmpty
import com.foodsocial.app.core.designsystem.SamplePhotoPlaceholder
import com.foodsocial.app.data.local.ingredientArtwork
import com.foodsocial.app.domain.model.Ingredient
import com.foodsocial.app.domain.model.IngredientCategory
import com.foodsocial.app.domain.model.ingredientKey

private val fridgeGreen = Color(0xFF10B981)
private val tileGray = Color(0xFFC8C0C0)

@Composable
internal fun SmartFridgeScreen(
    inventory: FridgeInventory,
    catalog: List<Ingredient>,
    onAdd: (Ingredient) -> Unit,
    onToggle: (Ingredient) -> Unit,
    onManage: () -> Unit,
    onRecommend: () -> Unit,
    onShopping: () -> Unit,
) {
    var query by rememberSaveable { mutableStateOf("") }
    var category by rememberSaveable { mutableStateOf<IngredientCategory?>(null) }
    var inFridge by rememberSaveable { mutableStateOf(false) }
    val normalizedQuery = ingredientKey(query)
    val fridgeByName = remember(inventory.ingredients) { inventory.ingredients.associateBy { ingredientKey(it.name) } }
    val source = if (inFridge) inventory.ingredients else catalog
    val visible = remember(source, category, normalizedQuery) { source.filter {
        (category == null || it.category == category) && ingredientKey(it.name).contains(normalizedQuery)
    } }
    val gridState = rememberLazyGridState()
    LaunchedEffect(inFridge, category, normalizedQuery) {
        gridState.scrollToItem(0)
    }

    Column(Modifier.fillMaxSize().imePadding()) {
        LazyVerticalGrid(
            columns = GridCells.Adaptive(144.dp),
            state = gridState,
            modifier = Modifier.weight(1f),
            contentPadding = PaddingValues(16.dp),
            horizontalArrangement = Arrangement.spacedBy(12.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            item(span = { GridItemSpan(maxLineSpan) }) {
                Column(verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    Image(
                        painter = painterResource(R.drawable.fridge_banner),
                        contentDescription = null,
                        modifier = Modifier.fillMaxWidth().heightIn(max = 160.dp).aspectRatio(3f)
                            .clip(MaterialTheme.shapes.large),
                        contentScale = ContentScale.Crop,
                    )
                    Text("Bạn đang có những nguyên liệu nào?", style = MaterialTheme.typography.titleLarge)
                    PrimaryTabRow(selectedTabIndex = if (inFridge) 1 else 0) {
                        Tab(!inFridge, onClick = { inFridge = false }, text = { Text("Danh mục") })
                        Tab(inFridge, onClick = { inFridge = true }, text = { Text("Trong tủ lạnh (${inventory.ingredients.size})") })
                    }
                    OutlinedTextField(
                        value = query,
                        onValueChange = { query = it },
                        label = { Text("Tìm nguyên liệu") },
                        modifier = Modifier.fillMaxWidth(),
                        singleLine = true,
                        trailingIcon = {
                            if (query.isNotEmpty()) TextButton(onClick = { query = "" }) { Text("Xóa tìm kiếm") }
                        },
                    )
                    LazyRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                        item {
                            FridgeCategoryChip("Tất cả", category == null) { category = null }
                        }
                        items(IngredientCategory.entries, key = { it.name }) { option ->
                            FridgeCategoryChip(option.label, category == option) { category = option }
                        }
                    }
                    TextButton(onClick = onManage) { Text("Quản lý nguyên liệu") }
                }
            }
            if (visible.isEmpty()) {
                item(span = { GridItemSpan(maxLineSpan) }) {
                    if (inFridge && inventory.ingredients.isEmpty()) {
                        RecipeEmpty("Tủ lạnh đang trống", "Thêm thực phẩm từ Danh mục hoặc nhập nguyên liệu trong mục Quản lý.")
                    } else {
                        RecipeEmpty("Không tìm thấy nguyên liệu", "Thử từ khóa khác hoặc chọn danh mục Tất cả.")
                    }
                }
            }
            items(visible, key = { it.id }) { ingredient ->
                val owned = if (inFridge) ingredient else fridgeByName[ingredientKey(ingredient.name)]
                val selected = owned?.id in inventory.selectedIds
                IngredientTile(ingredient, owned != null, selected) {
                    if (owned == null) onAdd(ingredient) else onToggle(owned)
                }
            }
        }
        Surface(shadowElevation = 2.dp) {
            Column(
                Modifier.fillMaxWidth().padding(horizontal = 16.dp, vertical = 8.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                Text("Đã chọn: ${inventory.selectedIds.size} nguyên liệu", style = MaterialTheme.typography.labelLarge)
                Button(
                    onClick = onRecommend,
                    enabled = inventory.selectedIds.isNotEmpty(),
                    modifier = Modifier.fillMaxWidth().heightIn(min = 48.dp),
                    colors = ButtonDefaults.buttonColors(containerColor = fridgeGreen, contentColor = Color(0xFF092D22)),
                ) { Text("Tìm món ăn phù hợp") }
                OutlinedButton(
                    onClick = onShopping,
                    enabled = inventory.selectedIds.isNotEmpty(),
                    modifier = Modifier.fillMaxWidth(),
                ) { Text("Thêm mục đã chọn vào mua sắm") }
            }
        }
    }
}

@Composable
private fun FridgeCategoryChip(label: String, selected: Boolean, onClick: () -> Unit) {
    FilterChip(
        selected = selected,
        onClick = onClick,
        label = { Text(label) },
        colors = FilterChipDefaults.filterChipColors(selectedContainerColor = fridgeGreen),
    )
}

@Composable
private fun IngredientTile(ingredient: Ingredient, owned: Boolean, selected: Boolean, onClick: () -> Unit) {
    Surface(
        selected = selected,
        onClick = onClick,
        modifier = Modifier.fillMaxWidth(),
        shape = MaterialTheme.shapes.medium,
        color = if (selected) MaterialTheme.colorScheme.primaryContainer else tileGray,
        contentColor = MaterialTheme.colorScheme.onSurface,
    ) {
        Column(
            Modifier.padding(10.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
        ) {
            Box(Modifier.fillMaxWidth().height(54.dp), contentAlignment = Alignment.Center) {
                val artwork = ingredientArtwork(ingredient)
                if (artwork != null) {
                    Image(
                        painterResource(artwork),
                        contentDescription = "Ảnh ${ingredient.name}",
                        modifier = Modifier.fillMaxSize().clip(MaterialTheme.shapes.small),
                        contentScale = ContentScale.Fit,
                    )
                } else {
                    SamplePhotoPlaceholder(ingredient.category.glyph, "Chưa có ảnh nguyên liệu", Modifier.size(54.dp))
                }
            }
            Text(
                if (selected) "✓ ${ingredient.name}" else ingredient.name,
                style = MaterialTheme.typography.titleSmall,
                textAlign = TextAlign.Center,
            )
            Text(
                when {
                    selected -> "Đã chọn"
                    owned -> "Trong tủ · Chọn"
                    else -> "+ Thêm vào tủ"
                },
                style = MaterialTheme.typography.labelSmall,
                textAlign = TextAlign.Center,
            )
        }
    }
}
