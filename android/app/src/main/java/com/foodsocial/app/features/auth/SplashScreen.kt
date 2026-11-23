package com.foodsocial.app.features.auth

import androidx.compose.foundation.layout.*
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Surface
import androidx.compose.material3.Text
import androidx.compose.runtime.*
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.foodsocial.app.R
import com.foodsocial.app.core.designsystem.*
import kotlinx.coroutines.delay

@Composable
internal fun SplashScreen(onReady: () -> Unit) {
    val finish by rememberUpdatedState(onReady)
    LaunchedEffect(Unit) {
        delay(900)
        finish()
    }

    Surface(color = SplashCream, modifier = Modifier.fillMaxSize()) {
        Box(Modifier.fillMaxSize().safeDrawingPadding().padding(24.dp)) {
            Column(
                modifier = Modifier.align(Alignment.Center),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                CookMateArtwork(R.drawable.cookmate_logo, Modifier.size(96.dp))
                Text("COOKMATE", color = BrandRed, style = MaterialTheme.typography.headlineSmall)
                Text(
                    "Hãy biến nguyên liệu thành món ăn ngay nào",
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                )
            }
            LinearProgressIndicator(
                modifier = Modifier.align(Alignment.BottomCenter).padding(bottom = 24.dp).width(210.dp),
                color = OnboardingGreen,
            )
        }
    }
}
