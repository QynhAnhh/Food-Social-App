package com.foodsocial.app.features.recipe_detail

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.LiveRegionMode
import androidx.compose.ui.semantics.liveRegion
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.*
import com.foodsocial.app.domain.model.Recipe

@Composable
internal fun CookingGuideScreen(recipe: Recipe, onBack: () -> Unit) {
    var step by rememberSaveable(recipe.id) { mutableIntStateOf(0) }
    var completedSteps by rememberSaveable(recipe.id) { mutableIntStateOf(0) }
    val total = recipe.steps.size
    val finished = completedSteps == total

    Column(
        Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        RecipeHeader("Hướng dẫn nấu", onBack)
        Text(recipe.title, style = MaterialTheme.typography.titleLarge)
        RecipeImage(recipe, Modifier.widthIn(max = 220.dp).fillMaxWidth().aspectRatio(1.65f))
        Surface(color = Color(0xFFFFDEDA), shape = MaterialTheme.shapes.medium) {
            Text(
                "Thời gian dự kiến: ${recipe.minutes} phút",
                Modifier.fillMaxWidth().padding(12.dp),
                style = MaterialTheme.typography.titleSmall,
            )
        }
        LinearProgressIndicator(
            progress = { completedSteps.toFloat() / total },
            modifier = Modifier.fillMaxWidth(),
        )
        Text(
            "Đã hoàn thành $completedSteps/$total bước",
            modifier = Modifier.semantics { liveRegion = LiveRegionMode.Polite },
            style = MaterialTheme.typography.labelLarge,
        )
        Surface(color = Color(0xFF86D8B3), shape = MaterialTheme.shapes.large) {
            Column(Modifier.fillMaxWidth().padding(18.dp), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                if (finished) {
                    Text("Bạn đã nấu xong!", style = MaterialTheme.typography.titleLarge)
                    Text("Chúc bạn ngon miệng.")
                } else {
                    Text("Bước ${step + 1} / $total", style = MaterialTheme.typography.titleLarge)
                    Text(recipe.steps[step], style = MaterialTheme.typography.bodyLarge)
                }
            }
        }
        if (finished) {
            CookMateButton("Về chi tiết món", onBack, Modifier.fillMaxWidth())
        } else {
            Row(Modifier.fillMaxWidth(), horizontalArrangement = Arrangement.spacedBy(8.dp)) {
                OutlinedButton(
                    onClick = { step-- },
                    enabled = step > 0,
                    modifier = Modifier.weight(1f).heightIn(min = 52.dp),
                ) { Text("Bước trước") }
                CookMateButton(
                    label = if (step == total - 1) "Hoàn thành" else "Bước tiếp theo",
                    onClick = {
                        completedSteps = maxOf(completedSteps, step + 1)
                        if (step < total - 1) step++
                    },
                    modifier = Modifier.weight(1f),
                    color = Color(0xFF31D259),
                    textColor = Color.Black,
                )
            }
        }
    }
}
