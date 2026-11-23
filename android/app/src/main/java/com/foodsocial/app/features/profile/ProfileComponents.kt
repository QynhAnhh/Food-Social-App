package com.foodsocial.app.features.profile

import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.text.KeyboardActions
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.semantics.contentDescription
import androidx.compose.ui.semantics.semantics
import androidx.compose.ui.text.input.ImeAction
import androidx.compose.ui.unit.dp

internal enum class SampleAvatar(val symbol: String, val label: String) {
    Chef("🍳", "Chảo trứng"),
    Sprout("🌱", "Mầm xanh"),
    Soup("🍲", "Nồi canh"),
    Tomato("🍅", "Cà chua"),
}

internal fun profileNameError(name: String): String? = when {
    name.isBlank() -> "Vui lòng nhập tên hiển thị."
    name.trim().length > 50 -> "Tên hiển thị tối đa 50 ký tự."
    else -> null
}

@Composable
internal fun ProfileNameField(name: String, onChange: (String) -> Unit, error: String?, onDone: () -> Unit) {
    OutlinedTextField(
        value = name,
        onValueChange = onChange,
        modifier = Modifier.fillMaxWidth(),
        label = { Text("Tên hiển thị") },
        singleLine = true,
        isError = error != null,
        supportingText = { error?.let { Text(it) } },
        keyboardOptions = KeyboardOptions(imeAction = ImeAction.Done),
        keyboardActions = KeyboardActions(onDone = { onDone() }),
    )
}

@Composable
internal fun ProfileAvatar(avatar: SampleAvatar) {
    Surface(
        modifier = Modifier.size(72.dp).semantics { contentDescription = "Ảnh đại diện: ${avatar.label}" },
        shape = CircleShape,
        color = MaterialTheme.colorScheme.surface,
    ) {
        Box(contentAlignment = Alignment.Center) {
            Text(avatar.symbol, style = MaterialTheme.typography.headlineMedium)
        }
    }
}
