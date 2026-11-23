package com.foodsocial.app.core.designsystem

import androidx.compose.foundation.Canvas
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.Path
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.graphics.drawscope.scale
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.text.style.TextOverflow
import androidx.compose.ui.unit.dp
import com.foodsocial.app.navigation.AppDestination

@Composable
internal fun CookMateBottomBar(
    current: AppDestination,
    onDestinationClick: (AppDestination) -> Unit,
) {
    NavigationBar(containerColor = MaterialTheme.colorScheme.surface) {
        AppDestination.bottomBarItems.forEach { destination ->
            val selected = destination == current
            NavigationBarItem(
                selected = selected,
                onClick = { onDestinationClick(destination) },
                icon = {
                    Box(
                        modifier = Modifier.size(32.dp).then(
                            if (destination == AppDestination.Create) {
                                Modifier.background(Color(0xFF10B981), RoundedCornerShape(8.dp))
                            } else Modifier
                        ),
                        contentAlignment = Alignment.Center,
                    ) {
                        DestinationIcon(destination)
                    }
                },
                label = {
                    Text(
                        if (destination == AppDestination.Create) "Tạo món" else destination.title,
                        maxLines = 2,
                        overflow = TextOverflow.Ellipsis,
                        textAlign = TextAlign.Center,
                    )
                },
                colors = NavigationBarItemDefaults.colors(
                    indicatorColor = MaterialTheme.colorScheme.primaryContainer,
                    selectedIconColor = MaterialTheme.colorScheme.primary,
                ),
            )
        }
    }
}

@Composable
private fun DestinationIcon(destination: AppDestination) {
    val color = LocalContentColor.current
    Canvas(Modifier.size(22.dp)) {
        scale(size.width / 24f, size.height / 24f, pivot = Offset.Zero) {
            fun line(x1: Float, y1: Float, x2: Float, y2: Float) {
                drawLine(color, Offset(x1, y1), Offset(x2, y2), strokeWidth = 1.8f)
            }
            fun box(x: Float, y: Float, width: Float, height: Float) {
                drawRect(color, Offset(x, y), Size(width, height), style = Stroke(1.6f))
            }
            when (destination) {
                AppDestination.Home -> {
                    val outline = Path().apply {
                        moveTo(3f, 10f)
                        lineTo(12f, 3f)
                        lineTo(21f, 10f)
                        lineTo(21f, 21f)
                        lineTo(3f, 21f)
                        close()
                    }
                    drawPath(outline, color, style = Stroke(1.8f))
                    box(10f, 14f, 4f, 7f)
                }
                AppDestination.Fridge -> {
                    box(5f, 3f, 14f, 18f)
                    line(5f, 10f, 19f, 10f)
                    line(8f, 5f, 8f, 8f)
                    line(8f, 13f, 8f, 16f)
                }
                AppDestination.Create -> {
                    line(5f, 12f, 19f, 12f)
                    line(12f, 5f, 12f, 19f)
                }
                AppDestination.Utilities -> {
                    box(3f, 3f, 7f, 7f)
                    box(14f, 3f, 7f, 7f)
                    box(3f, 14f, 7f, 7f)
                    box(14f, 14f, 7f, 7f)
                }
                AppDestination.Profile -> {
                    drawCircle(color, 4f, Offset(12f, 7f), style = Stroke(1.8f))
                    drawArc(color, 180f, 180f, false, Offset(4f, 14f), Size(16f, 14f), style = Stroke(1.8f))
                }
                else -> Unit
            }
        }
    }
}
