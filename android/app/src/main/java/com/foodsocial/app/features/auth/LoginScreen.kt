package com.foodsocial.app.features.auth

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import com.foodsocial.app.R
import com.foodsocial.app.core.designsystem.*

@Composable
fun LoginScreen(
    onGoogleLoginClick: () -> Unit,
    onGuestClick: () -> Unit,
) {
    Surface(color = LoginCream, modifier = Modifier.fillMaxSize()) {
        BoxWithConstraints(Modifier.safeDrawingPadding(), contentAlignment = Alignment.TopCenter) {
            val viewportHeight = maxHeight
            Column(
                modifier = Modifier.widthIn(max = 480.dp).fillMaxWidth()
                    .verticalScroll(rememberScrollState())
                    .heightIn(min = viewportHeight)
                    .padding(horizontal = 28.dp, vertical = 28.dp),
                horizontalAlignment = Alignment.CenterHorizontally,
                verticalArrangement = Arrangement.spacedBy(24.dp, Alignment.CenterVertically),
            ) {
                CookMateArtwork(R.drawable.login_pot, Modifier.size(124.dp))
                Column(
                    horizontalAlignment = Alignment.CenterHorizontally,
                    verticalArrangement = Arrangement.spacedBy(6.dp),
                ) {
                    Text("Chào mừng bạn đến với", style = MaterialTheme.typography.headlineSmall, textAlign = TextAlign.Center)
                    Text("COOKMATE", color = BrandRed, style = MaterialTheme.typography.titleLarge)
                }
                Text(
                    "Đăng nhập để lưu công việc và đồng bộ trên mọi thiết bị của bạn",
                    style = MaterialTheme.typography.bodyMedium,
                    textAlign = TextAlign.Center,
                )
                Spacer(Modifier.height(12.dp))
                Button(
                    onClick = onGoogleLoginClick,
                    modifier = Modifier.fillMaxWidth().heightIn(min = 52.dp),
                    shape = CircleShape,
                ) {
                    CookMateArtwork(R.drawable.google_mark, Modifier.size(20.dp))
                    Spacer(Modifier.width(12.dp))
                    Text("Tiếp tục với Google")
                }
                Row(verticalAlignment = Alignment.CenterVertically) {
                    HorizontalDivider(Modifier.weight(1f))
                    Text("hoặc", Modifier.padding(horizontal = 12.dp))
                    HorizontalDivider(Modifier.weight(1f))
                }
                TextButton(onClick = onGuestClick) { Text("Dùng thử không cần tài khoản") }
                Text(
                    "Chế độ mô phỏng. Phiên mẫu chỉ dùng dữ liệu cục bộ.",
                    style = MaterialTheme.typography.bodySmall,
                    textAlign = TextAlign.Center,
                )
            }
        }
    }
}
