package com.foodsocial.app.features.profile

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.*
import androidx.compose.runtime.Composable
import androidx.compose.runtime.remember
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.platform.LocalUriHandler
import androidx.compose.ui.unit.dp
import androidx.compose.ui.window.Dialog

@Composable
internal fun SamplePhotoCredits(onDismiss: () -> Unit) {
    val assets = LocalContext.current.assets
    val uriHandler = LocalUriHandler.current
    val photos = remember(assets) {
        assets.open("sample-photo-credits.tsv").bufferedReader().useLines { lines ->
            lines.drop(1).map { it.split('\t') }.toList()
        }
    }
    Dialog(onDismissRequest = onDismiss) {
        Surface(shape = MaterialTheme.shapes.large) {
            Column(Modifier.heightIn(max = 540.dp).padding(16.dp)) {
                Text("Nguồn ảnh mẫu", style = MaterialTheme.typography.titleLarge)
                LazyColumn(Modifier.weight(1f), verticalArrangement = Arrangement.spacedBy(8.dp)) {
                    items(photos, key = { it[3] }) { photo ->
                        Column {
                            Text(photo[2], style = MaterialTheme.typography.titleMedium)
                            Text(photo[4], style = MaterialTheme.typography.bodyMedium)
                            Text(photo[5], style = MaterialTheme.typography.bodyMedium)
                            Text(photo[9], style = MaterialTheme.typography.bodySmall)
                            TextButton(onClick = { uriHandler.openUri(photo[6]) }) { Text("Ảnh gốc") }
                            if (photo[8].isNotBlank()) {
                                TextButton(onClick = { uriHandler.openUri(photo[8]) }) { Text(photo[7]) }
                            } else {
                                Text(photo[7], style = MaterialTheme.typography.bodySmall)
                            }
                            HorizontalDivider()
                        }
                    }
                }
                TextButton(onClick = onDismiss) { Text("Đóng") }
            }
        }
    }
}
