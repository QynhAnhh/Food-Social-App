package com.foodsocial.app.domain.model

import java.math.BigDecimal
import java.math.MathContext
import java.util.UUID

internal data class ShoppingItem(
    val name: String,
    val quantity: BigDecimal?,
    val unit: String,
    val id: String = UUID.randomUUID().toString(),
    val purchased: Boolean = false,
) {
    val amountLabel: String get() = listOfNotNull(
        quantity?.stripTrailingZeros()?.toPlainString()?.replace('.', ','),
        unit.takeIf { it.isNotBlank() },
    ).joinToString(" ")
}

private val recipeAmount = Regex("""^\s*(\d+(?:\s*/\s*\d+|[.,]\d+)?)\s*(.*)$""")

internal fun RecipeIngredient.toShoppingItem(): ShoppingItem {
    val match = recipeAmount.matchEntire(amount)
    val quantity = match?.groupValues?.get(1)?.let(::parseShoppingQuantity)
    val unit = if (quantity == null) amount.trim()
    else match?.groupValues?.get(2).orEmpty().substringBefore(" (").trim()
    return ShoppingItem(name, quantity, unit)
}

internal fun parseShoppingQuantity(input: String): BigDecimal? {
    val text = input.trim().replace(',', '.')
    if (text.length > 24) return null
    val fraction = text.split('/')
    if (fraction.size !in 1..2) return null
    val numerator = fraction[0].trim().toBigDecimalOrNull() ?: return null
    val result = if (fraction.size == 2) {
        val denominator = fraction[1].trim().toBigDecimalOrNull() ?: return null
        if (denominator.signum() <= 0) return null
        numerator.divide(denominator, MathContext.DECIMAL64)
    } else numerator
    return result.takeIf { it.signum() > 0 && it.scale() in -6..20 && it <= BigDecimal("1000000000") }
}

internal fun List<ShoppingItem>.addShoppingItem(item: ShoppingItem): List<ShoppingItem> {
    val existing = firstOrNull {
        ingredientKey(it.name) == ingredientKey(item.name) &&
            ingredientKey(it.unit) == ingredientKey(item.unit) &&
            (it.quantity == null) == (item.quantity == null)
    } ?: return this + item
    val total = if (existing.quantity == null || item.quantity == null) null else existing.quantity + item.quantity
    return map { if (it.id == existing.id) it.copy(quantity = total, purchased = it.purchased && item.purchased) else it }
}
