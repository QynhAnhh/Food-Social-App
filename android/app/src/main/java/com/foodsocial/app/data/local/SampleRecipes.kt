package com.foodsocial.app.data.local

import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory
import com.foodsocial.app.domain.model.RecipeDifficulty
import com.foodsocial.app.domain.model.RecipeIngredient

internal val sampleRecipes = (listOf(
    Recipe(
        id = "tomato-eggs",
        title = "Trứng xào cà chua",
        author = "Bếp CookMate",
        rating = "4,5",
        category = RecipeCategory.StirFry,
        difficulty = RecipeDifficulty.Easy,
        minutes = 15,
        servings = 2,
        ingredients = listOf(
            RecipeIngredient("Trứng gà", "2 quả (100 g)", 155),
            RecipeIngredient("Cà chua", "1 quả (150 g)", 27),
            RecipeIngredient("Hành lá và gia vị", "10 g", 10, listOf("Hành lá", "Gia vị")),
            RecipeIngredient("Dầu ăn", "1 thìa cà phê", 35),
        ),
        steps = listOf(
            "Rửa sạch cà chua và thái hạt lựu. Đập trứng vào bát, thêm chút gia vị rồi đánh tan.",
            "Đun nóng dầu trong chảo. Cho cà chua vào xào mềm để tạo sốt.",
            "Đổ trứng vào, đảo nhẹ cùng sốt 2–3 phút đến khi trứng chín. Rắc hành lá rồi tắt bếp.",
        ),
        followedAuthor = true,
    ),
    Recipe(
        id = "tomato-soup",
        title = "Canh trứng cà chua",
        author = "Bếp nhà An",
        rating = "4,7",
        category = RecipeCategory.Soup,
        difficulty = RecipeDifficulty.Easy,
        minutes = 20,
        servings = 3,
        ingredients = listOf(
            RecipeIngredient("Cà chua", "2 quả", 45),
            RecipeIngredient("Trứng gà", "2 quả", 155),
            RecipeIngredient("Hành lá", "10 g", 3),
            RecipeIngredient("Dầu ăn", "1 thìa cà phê", 35),
        ),
        steps = listOf(
            "Thái múi cau cà chua, cắt hành lá và đánh trứng trong bát.",
            "Xào cà chua với dầu, thêm 700 ml nước rồi đun sôi.",
            "Rót trứng thành dòng mỏng vào nồi, khuấy nhẹ để tạo vân. Nấu đến khi trứng chín, nêm vừa ăn và thêm hành lá.",
        ),
    ),
    Recipe(
        id = "tomato-tofu",
        title = "Đậu hũ sốt cà chua",
        author = "Bếp CookMate",
        rating = "4,8",
        category = RecipeCategory.Vegetarian,
        difficulty = RecipeDifficulty.Easy,
        minutes = 25,
        servings = 2,
        ingredients = listOf(
            RecipeIngredient("Đậu hũ", "300 g", 228),
            RecipeIngredient("Cà chua", "2 quả", 45),
            RecipeIngredient("Hành lá", "10 g", 3),
            RecipeIngredient("Dầu ăn", "2 thìa cà phê", 70),
        ),
        steps = listOf(
            "Thấm khô đậu hũ và cắt miếng vừa ăn. Thái nhỏ cà chua.",
            "Áp chảo đậu hũ đến khi vàng. Xào cà chua trong cùng chảo với một ít nước để tạo sốt.",
            "Cho đậu vào sốt, đun nhỏ lửa 5 phút. Nêm vừa ăn và rắc hành lá.",
        ),
        followedAuthor = true,
    ),
    Recipe(
        id = "pork-omelette",
        title = "Trứng chiên thịt bằm",
        author = "Góc bếp Minh",
        rating = "4,6",
        category = RecipeCategory.Fried,
        difficulty = RecipeDifficulty.Medium,
        minutes = 35,
        servings = 2,
        ingredients = listOf(
            RecipeIngredient("Trứng gà", "3 quả", 230),
            RecipeIngredient("Thịt heo bằm", "100 g", 200),
            RecipeIngredient("Hành lá", "15 g", 5),
            RecipeIngredient("Dầu ăn", "2 thìa cà phê", 70),
        ),
        steps = listOf(
            "Cắt nhỏ hành lá. Đánh trứng cùng hành và gia vị.",
            "Xào thịt heo bằm đến khi chín hẳn rồi dàn thành lớp mỏng trong chảo.",
            "Đổ trứng phủ lên thịt, đậy nắp và chiên lửa nhỏ đến khi trứng đông lại.",
            "Lật mặt trứng, chiên đến khi vàng và chín hoàn toàn rồi cắt miếng.",
        ),
    ),
) + vietnameseRecipes).map { it.copy(image = recipeSamplePhotos[it.id]) }
