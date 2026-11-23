package com.foodsocial.app.features.shopping_list

import androidx.compose.foundation.layout.*
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import com.foodsocial.app.core.designsystem.CookMateButton
import com.foodsocial.app.domain.model.ShoppingItem
import com.foodsocial.app.domain.model.parseShoppingQuantity

@OptIn(ExperimentalMaterial3Api::class)
@Composable
internal fun ShoppingItemEditorSheet(
    item: ShoppingItem?,
    onSave: (ShoppingItem) -> Unit,
    onDismiss: () -> Unit,
) {
    var name by rememberSaveable { mutableStateOf(item?.name.orEmpty()) }
    var amount by rememberSaveable { mutableStateOf(item?.quantity?.stripTrailingZeros()?.toPlainString().orEmpty()) }
    var unit by rememberSaveable { mutableStateOf(item?.unit.orEmpty()) }
    var submitted by rememberSaveable { mutableStateOf(false) }
    val quantity = parseShoppingQuantity(amount)
    val requiresNumber = item == null || item.quantity != null || amount.isNotBlank()
    val amountError = submitted && requiresNumber && quantity == null

    ModalBottomSheet(onDismissRequest = onDismiss, sheetState = rememberModalBottomSheetState(skipPartiallyExpanded = true)) {
        Column(
            Modifier.fillMaxWidth().verticalScroll(rememberScrollState()).padding(20.dp),
            verticalArrangement = Arrangement.spacedBy(12.dp),
        ) {
            Text(if (item == null) "Thêm mục mua sắm" else "Sửa mục mua sắm", style = MaterialTheme.typography.titleLarge)
            OutlinedTextField(
                name, { name = it }, Modifier.fillMaxWidth(),
                label = { Text("Tên nguyên liệu") }, singleLine = true,
                isError = submitted && name.isBlank(),
                supportingText = { if (submitted && name.isBlank()) Text("Vui lòng nhập tên nguyên liệu.") },
            )
            OutlinedTextField(
                amount, { amount = it }, Modifier.fillMaxWidth(),
                label = { Text("Số lượng") }, singleLine = true,
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Decimal),
                isError = amountError,
                supportingText = { if (amountError) Text("Nhập số lượng hợp lệ lớn hơn 0.") },
            )
            OutlinedTextField(
                unit, { unit = it }, Modifier.fillMaxWidth(),
                label = { Text("Đơn vị hoặc ghi chú") }, singleLine = true,
            )
            CookMateButton(
                "Lưu mục mua sắm",
                {
                    submitted = true
                    if (name.isNotBlank() && (!requiresNumber || quantity != null)) {
                        val edited = item?.copy(name = name.trim(), quantity = quantity, unit = unit.trim())
                            ?: ShoppingItem(name.trim(), quantity, unit.trim())
                        onSave(edited)
                    }
                },
                Modifier.fillMaxWidth(),
            )
        }
    }
}
