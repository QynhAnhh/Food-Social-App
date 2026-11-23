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
import com.foodsocial.app.core.designsystem.RecipeHeader

@Composable
internal fun EditProfileScreen(
    initialName: String,
    initialAvatar: SampleAvatar,
    onBack: () -> Unit,
    onSave: (String, SampleAvatar) -> Unit,
) {
    var name by rememberSaveable { mutableStateOf(initialName) }
    var avatar by rememberSaveable { mutableStateOf(initialAvatar) }
    var submitted by rememberSaveable { mutableStateOf(false) }
    val error = profileNameError(name)
    val save = {
        submitted = true
        if (error == null) onSave(name.trim(), avatar)
    }

    Column(
        Modifier.fillMaxSize().imePadding().verticalScroll(rememberScrollState()).padding(16.dp),
        verticalArrangement = Arrangement.spacedBy(14.dp),
    ) {
        RecipeHeader("Chỉnh sửa hồ sơ", onBack)
        ProfileAvatar(avatar)
        ProfileNameField(name, { name = it }, error.takeIf { submitted }, onDone = save)
        Text("Ảnh đại diện mẫu", style = MaterialTheme.typography.titleMedium)
        FlowRow(horizontalArrangement = Arrangement.spacedBy(8.dp)) {
            SampleAvatar.entries.forEach { item ->
                FilterChip(
                    selected = item == avatar,
                    onClick = { avatar = item },
                    label = { Text("${item.symbol} ${item.label}") },
                )
            }
        }
        CookMateButton("Lưu hồ sơ", save, Modifier.fillMaxWidth())
    }
}
