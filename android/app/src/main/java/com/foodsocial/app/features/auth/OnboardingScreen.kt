package com.foodsocial.app.features.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.pager.HorizontalPager
import androidx.compose.foundation.pager.rememberPagerState
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.draw.clip
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.foodsocial.app.R
import com.foodsocial.app.core.designsystem.*
import kotlinx.coroutines.launch

private data class OnboardingPageInfo(
    val artwork: Int,
    val title: String,
    val description: String,
    val buttonText: String,
)

private val pages = listOf(
    OnboardingPageInfo(
        R.drawable.onboarding_fridge,
        "Hôm nay bếp bạn có gì?",
        "Chọn những nguyên liệu bạn đang có để khám phá các món ăn có thể chế biến.",
        "Tiếp tục",
    ),
    OnboardingPageInfo(
        R.drawable.onboarding_cooking,
        "Bắt tay vào nấu nào!",
        "Tìm kiếm công thức yêu thích, lưu lại món ngon và biến mỗi bữa ăn thành niềm vui.",
        "Bắt đầu ngay",
    ),
)

@Composable
fun OnboardingScreen(onFinish: () -> Unit) {
    val pagerState = rememberPagerState(pageCount = { pages.size })
    val scope = rememberCoroutineScope()

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(Modifier.safeDrawingPadding().padding(horizontal = 20.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
            ) {
                CookMateArtwork(R.drawable.cookmate_logo, Modifier.size(32.dp).clip(MaterialTheme.shapes.small))
                Text("CookMate", Modifier.weight(1f).padding(start = 8.dp), style = MaterialTheme.typography.titleSmall)
                TextButton(onClick = onFinish) { Text("Bỏ qua") }
            }

            HorizontalPager(state = pagerState, modifier = Modifier.weight(1f)) { position ->
                OnboardingPage(pages[position])
            }

            val pageLabel = "Trang ${pagerState.currentPage + 1} trên ${pages.size}"
            Row(
                modifier = Modifier.padding(vertical = 12.dp).semantics { contentDescription = pageLabel },
                horizontalArrangement = Arrangement.spacedBy(4.dp),
            ) {
                repeat(pages.size) { index ->
                    val selected = index == pagerState.currentPage
                    Box(
                        Modifier.size(width = if (selected) 18.dp else 8.dp, height = 5.dp)
                            .clip(CircleShape)
                            .background(if (selected) OnboardingGreen else MaterialTheme.colorScheme.surfaceVariant),
                    )
                }
            }

            CookMateButton(
                label = pages[pagerState.currentPage].buttonText,
                onClick = {
                    val page = pagerState.currentPage
                    if (page == pages.lastIndex) {
                        onFinish()
                    } else {
                        scope.launch { pagerState.animateScrollToPage(page + 1) }
                    }
                },
                modifier = Modifier.align(Alignment.CenterHorizontally)
                    .padding(bottom = 20.dp).widthIn(min = 200.dp),
                color = OnboardingGreen,
                textColor = Color.Black,
            )
        }
    }
}

@Composable
private fun OnboardingPage(page: OnboardingPageInfo) {
    Column(
        modifier = Modifier.fillMaxSize().verticalScroll(rememberScrollState()).padding(vertical = 12.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.spacedBy(20.dp, Alignment.CenterVertically),
    ) {
        CookMateArtwork(page.artwork, Modifier.fillMaxWidth(0.9f).heightIn(max = 300.dp).aspectRatio(1.05f))
        Surface(
            modifier = Modifier.widthIn(max = 460.dp).fillMaxWidth(),
            shape = MaterialTheme.shapes.large,
            color = OnboardingMint,
            contentColor = MaterialTheme.colorScheme.onPrimaryContainer,
        ) {
            Column(
                Modifier.padding(20.dp),
                verticalArrangement = Arrangement.spacedBy(8.dp),
            ) {
                Text(page.title, style = MaterialTheme.typography.titleLarge)
                Text(page.description, textAlign = TextAlign.Start)
            }
        }
    }
}
