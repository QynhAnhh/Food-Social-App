package com.foodsocial.app.core.designsystem

import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Shapes
import androidx.compose.material3.Typography
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontFamily
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp

internal val SplashCream = Color(0xFFF8F7D1)
internal val LoginCream = Color(0xFFF9EFE6)
internal val OnboardingMint = Color(0xFFA7EAB5)
internal val OnboardingGreen = Color(0xFF3FE845)
internal val ForestGreen = Color(0xFF356245)
internal val BrandRed = Color(0xFF781E26)

private val colors = lightColorScheme(
    primary = ForestGreen,
    onPrimary = Color.White,
    primaryContainer = OnboardingMint,
    onPrimaryContainer = Color(0xFF14331E),
    secondaryContainer = Color(0xFFECFDF5),
    background = Color.White,
    surface = Color.White,
    onSurface = Color(0xFF181616),
)

private val baseTypography = Typography()
private val typography = baseTypography.copy(
    headlineSmall = baseTypography.headlineSmall.copy(
        fontFamily = FontFamily.Serif,
        fontWeight = FontWeight.Bold,
    ),
    titleLarge = baseTypography.titleLarge.copy(fontWeight = FontWeight.Bold),
)

@Composable
fun CookMateTheme(content: @Composable () -> Unit) {
    MaterialTheme(
        colorScheme = colors,
        typography = typography,
        shapes = Shapes(medium = RoundedCornerShape(16.dp), large = RoundedCornerShape(24.dp)),
        content = content,
    )
}
