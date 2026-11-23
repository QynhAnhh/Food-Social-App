package com.foodsocial.app.features.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.CookMateButton

@Composable
internal fun ProfileSetupScreen(onComplete: (String) -> Unit, onBack: () -> Unit) {
    var name by rememberSaveable { mutableStateOf("") }
    var submitted by rememberSaveable { mutableStateOf(false) }
    val error = profileNameError(name)
    val submit = {
        submitted = true
        if (error == null) onComplete(name.trim())
    }

    Surface(modifier = Modifier.fillMaxSize()) {
        Column(
            modifier = Modifier.safeDrawingPadding().imePadding().verticalScroll(rememberScrollState()).padding(24.dp),
            verticalArrangement = Arrangement.spacedBy(16.dp),
        ) {
            TextButton(onClick = onBack) { Text("Quay lại") }
            Text("Thiết lập hồ sơ", style = MaterialTheme.typography.headlineSmall)
            Text("Chọn tên hiển thị cho phiên CookMate mẫu của bạn.")
            ProfileNameField(name, { name = it }, error.takeIf { submitted }, onDone = submit)
            CookMateButton("Vào CookMate", submit, Modifier.fillMaxWidth())
        }
    }
}
