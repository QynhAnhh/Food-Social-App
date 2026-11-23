package com.foodsocial.app.data.local

import com.foodsocial.app.domain.model.Ingredient
import com.foodsocial.app.domain.model.IngredientCategory
import com.foodsocial.app.domain.model.IngredientCategory.*
import com.foodsocial.app.domain.model.ingredientKey

internal val sampleIngredients = buildList {
    addAll(group(Greens,
        "water-spinach" to "Rau muống", "bok-choy" to "Cải thìa", "mustard-greens" to "Cải xanh",
        "choy-sum" to "Cải ngọt", "malabar-spinach" to "Mồng tơi", "jute" to "Rau đay",
        "amaranth" to "Rau dền", "sweet-leaf" to "Rau ngót", "lettuce" to "Xà lách",
        "cabbage" to "Bắp cải", "bean-sprouts" to "Giá đỗ", "scallions" to "Hành lá",
        "dill" to "Thì là", "basil" to "Húng quế", "coriander" to "Ngò rí",
        "broccoli" to "Bông cải xanh", "cauliflower" to "Bông cải trắng",
    ))
    addAll(group(Roots,
        "carrots" to "Cà rốt", "potatoes" to "Khoai tây", "sweet-potatoes" to "Khoai lang",
        "white-radish" to "Củ cải trắng", "beetroot" to "Củ dền", "kohlrabi" to "Su hào",
        "taro" to "Khoai môn", "lotus-root" to "Củ sen", "cassava" to "Khoai mì",
        "onion" to "Hành tây",
    ))
    addAll(group(Fruits,
        "tomatoes" to "Cà chua", "cucumber" to "Dưa leo", "pineapple" to "Dứa",
        "mango" to "Xoài", "banana" to "Chuối", "lime" to "Chanh", "papaya" to "Đu đủ",
        "watermelon" to "Dưa hấu", "orange" to "Cam", "dragon-fruit" to "Thanh long",
        "avocado" to "Bơ trái", "coconut" to "Dừa", "bitter-melon" to "Khổ qua",
        "pumpkin" to "Bí đỏ", "winter-melon" to "Bí đao", "okra" to "Đậu bắp",
        "aubergine" to "Cà tím", "bell-pepper" to "Ớt chuông", "chayote" to "Su su",
    ))
    addAll(group(Meat,
        "beef" to "Thịt bò", "pork" to "Thịt heo", "chicken" to "Thịt gà",
        "duck" to "Thịt vịt", "minced-pork" to "Thịt heo bằm", "pork-belly" to "Ba chỉ heo",
        "pork-ribs" to "Sườn heo", "chicken-thigh" to "Đùi gà", "chicken-breast" to "Ức gà",
        "buffalo" to "Thịt trâu", "goat" to "Thịt dê",
    ))
    addAll(group(Fish,
        "fish" to "Cá", "snakehead" to "Cá lóc", "mackerel" to "Cá thu",
        "basa" to "Cá basa", "tilapia" to "Cá rô phi", "salmon" to "Cá hồi",
        "anchovy" to "Cá cơm", "carp" to "Cá chép", "tuna" to "Cá ngừ",
    ))
    addAll(group(Seafood,
        "shrimp" to "Tôm", "squid" to "Mực", "crab" to "Cua", "clam" to "Nghêu",
        "mussel" to "Vẹm", "oyster" to "Hàu", "snail" to "Ốc", "octopus" to "Bạch tuộc",
    ))
    addAll(group(Eggs,
        "eggs" to "Trứng gà", "duck-eggs" to "Trứng vịt", "quail-eggs" to "Trứng cút",
        "salted-eggs" to "Trứng muối",
    ))
    addAll(group(Dairy,
        "milk" to "Sữa tươi", "yogurt" to "Sữa chua", "condensed-milk" to "Sữa đặc",
        "cheese" to "Phô mai", "butter" to "Bơ lạt",
    ))
    addAll(group(Mushrooms,
        "shiitake" to "Nấm hương", "oyster-mushroom" to "Nấm bào ngư", "straw-mushroom" to "Nấm rơm",
        "wood-ear" to "Mộc nhĩ", "enoki" to "Nấm kim châm", "king-oyster" to "Nấm đùi gà",
    ))
    addAll(group(Beans,
        "tofu" to "Đậu hũ", "mung-beans" to "Đậu xanh", "black-beans" to "Đậu đen",
        "red-beans" to "Đậu đỏ", "soybeans" to "Đậu nành", "peanuts" to "Đậu phộng",
        "green-beans" to "Đậu cô ve", "peas" to "Đậu Hà Lan",
    ))
    addAll(group(Grains,
        "rice" to "Gạo tẻ", "sticky-rice" to "Gạo nếp", "corn" to "Bắp",
        "oats" to "Yến mạch", "flour" to "Bột mì", "rice-flour" to "Bột gạo",
        "rice-noodles" to "Bún tươi", "pho-noodles" to "Bánh phở",
        "vermicelli" to "Miến", "bread" to "Bánh mì", "egg-noodles" to "Mì trứng",
    ))
    addAll(group(Seasoning,
        "oil" to "Dầu ăn", "seasoning" to "Gia vị", "salt" to "Muối", "sugar" to "Đường",
        "fish-sauce" to "Nước mắm", "soy-sauce" to "Nước tương", "oyster-sauce" to "Dầu hào",
        "pepper" to "Tiêu", "garlic" to "Tỏi", "ginger" to "Gừng", "lemongrass" to "Sả",
        "chili" to "Ớt", "shallots" to "Hành tím", "vinegar" to "Giấm", "turmeric" to "Nghệ",
        "shrimp-paste" to "Mắm tôm", "tamarind" to "Me", "five-spice" to "Ngũ vị hương",
        "lime-leaves" to "Lá chanh",
    ))
    addAll(group(Other,
        "rice-paper" to "Bánh tráng", "coconut-milk" to "Nước cốt dừa",
        "coconut-water" to "Nước dừa", "tapioca" to "Bột năng", "sesame" to "Mè",
        "seaweed" to "Rong biển", "lotus-seeds" to "Hạt sen", "pandan" to "Lá dứa",
    ))
}

private fun group(category: IngredientCategory, vararg items: Pair<String, String>): List<Ingredient> =
    items.map { (id, name) -> Ingredient(id, name, category) }

private val catalogById = sampleIngredients.associateBy(Ingredient::id)
private val catalogByName = sampleIngredients.associateBy { ingredientKey(it.name) }

internal fun catalogIngredient(id: String): Ingredient = catalogById.getValue(id)

internal fun ingredientArtwork(ingredient: Ingredient): Int? =
    catalogByName[ingredientKey(ingredient.name)]?.let { ingredientSamplePhotos[it.id] }
