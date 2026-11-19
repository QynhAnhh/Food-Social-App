package com.foodsocial.app.features.auth


import androidx.compose.foundation.background
import androidx.compose.foundation.layout.*
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun LoginScreen(
    onGoogleLoginClick: () -> Unit = {},
    onGuestClick: () -> Unit = {}
) {
    val bgColor = Color(0xFF6EFA9B)

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(bgColor)
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally
    ) {
        Spacer(modifier = Modifier.height(60.dp))

        // Vị trí logo, sẽ bổ sung ảnh sau
        Text(
            text = "🍲",
            fontSize = 90.sp
        )

        Spacer(modifier = Modifier.height(32.dp))

        Text(
            text = "Chào mừng bạn đến với",
            fontSize = 24.sp,
            color = Color.Black
        )

        Text(
            text = "COOKMATE",
            fontSize = 32.sp,
            fontWeight = FontWeight.Bold,
            color = Color(0xFFD32F2F)
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "Đăng nhập để lưu công việc và đồng bộ trên mọi thiết bị của bạn",
            fontSize = 14.sp,
            color = Color.DarkGray,
            textAlign = TextAlign.Center,
            modifier = Modifier.padding(horizontal = 16.dp)
        )

        Spacer(modifier = Modifier.weight(1f))

        Button(
            onClick = onGoogleLoginClick,
            modifier = Modifier
                .fillMaxWidth()
                .height(56.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color(0xFFF3E5F5)
            ),
            shape = RoundedCornerShape(12.dp)
        ) {
            Text(
                text = "Tiếp tục với Google",
                color = Color.Black,
                fontSize = 16.sp
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        Row(
            verticalAlignment = Alignment.CenterVertically,
            modifier = Modifier.fillMaxWidth()
        ) {
            HorizontalDivider(
                modifier = Modifier.weight(1f),
                color = Color.Gray
            )

            Text(
                text = " hoặc ",
                color = Color.DarkGray,
                modifier = Modifier.padding(horizontal = 8.dp)
            )

            HorizontalDivider(
                modifier = Modifier.weight(1f),
                color = Color.Gray
            )
        }

        Spacer(modifier = Modifier.height(24.dp))

        TextButton(onClick = onGuestClick) {
            Text(
                text = "Dùng thử không cần tài khoản",
                color = Color(0xFF5C6BC0),
                fontSize = 16.sp
            )
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}
