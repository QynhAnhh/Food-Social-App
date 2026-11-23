package com.foodsocial.app.data.local

import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory
import com.foodsocial.app.domain.model.RecipeCategory.*
import com.foodsocial.app.domain.model.RecipeDifficulty
import com.foodsocial.app.domain.model.RecipeDifficulty.*
import com.foodsocial.app.domain.model.RecipeIngredient

private val familyKitchenCategories = setOf(Soup, Boiled, Family, Dessert)

internal val vietnameseRecipes = listOf(
    localRecipe(
        "sour-fish-soup", "Canh chua cá lóc", Soup, 35, 4, Medium,
        listOf(
            need("snakehead", "400 g"),
            need("pineapple", "150 g"),
            need("tomatoes", "2 quả"),
            need("tamarind", "20 g"),
            need("bean-sprouts", "100 g"),
            need("fish-sauce", "1 thìa canh"),
        ),
        listOf(
            "Nấu nước me rồi lọc bỏ hạt, cho cà chua và dứa vào đun sôi.",
            "Thả cá lóc vào nấu chín, hớt bọt và nêm nước mắm.",
            "Cho giá đỗ vào cuối, đun sôi lại rồi tắt bếp.",
        ),
    ),
    localRecipe(
        "malabar-shrimp-soup", "Canh mồng tơi nấu tôm", Soup, 22, 3, Easy,
        listOf(
            need("malabar-spinach", "250 g"),
            need("shrimp", "180 g"),
            need("shallots", "1 củ"),
            need("fish-sauce", "1 thìa cà phê"),
        ),
        listOf(
            "Bóc vỏ, bỏ chỉ tôm rồi băm thô. Rửa và cắt rau.",
            "Phi hành tím, xào tôm rồi thêm 700 ml nước.",
            "Khi nước sôi, cho rau vào nấu chín và nêm nước mắm.",
        ),
    ),
    localRecipe(
        "sweet-leaf-pork-soup", "Canh rau ngót thịt bằm", Soup, 25, 3, Easy,
        listOf(
            need("sweet-leaf", "250 g"),
            need("minced-pork", "180 g"),
            need("shallots", "1 củ"),
            need("fish-sauce", "1 thìa cà phê"),
        ),
        listOf(
            "Tuốt lá rau ngót, rửa sạch và vò nhẹ.",
            "Phi hành tím, đảo thịt bằm đến khi tơi rồi thêm nước.",
            "Đun thịt chín, thêm rau và nấu mềm, nêm nước mắm trước khi dùng.",
        ),
    ),
    localRecipe(
        "water-spinach-garlic", "Rau muống xào tỏi", StirFry, 15, 3, Easy,
        listOf(
            need("water-spinach", "350 g"),
            need("garlic", "4 tép"),
            need("oil", "1 thìa canh"),
            need("salt", "1 nhúm"),
        ),
        listOf(
            "Nhặt rau, rửa sạch rồi để ráo. Đập dập tỏi.",
            "Phi thơm tỏi, cho rau vào đảo nhanh trên lửa lớn.",
            "Nêm muối, đảo đến khi rau vừa mềm rồi dùng nóng.",
        ),
    ),
    localRecipe(
        "beef-bell-pepper", "Bò xào ớt chuông", StirFry, 25, 3, Easy,
        listOf(
            need("beef", "300 g"),
            need("bell-pepper", "2 quả"),
            need("onion", "1 củ"),
            need("garlic", "3 tép"),
            need("oyster-sauce", "1 thìa canh"),
            need("oil", "1 thìa canh"),
        ),
        listOf(
            "Thái bò ngang thớ, ướp với dầu hào; cắt rau củ vừa miếng.",
            "Phi tỏi và xào bò trên lửa lớn, trút ra đĩa.",
            "Xào ớt và hành tây vừa chín, cho bò lại vào đảo nhanh rồi tắt bếp.",
        ),
    ),
    localRecipe(
        "bok-choy-mushrooms", "Cải thìa xào nấm hương", StirFry, 20, 2, Easy,
        listOf(
            need("bok-choy", "300 g"),
            need("shiitake", "120 g"),
            need("garlic", "2 tép"),
            need("soy-sauce", "1 thìa canh"),
            need("oil", "1 thìa canh"),
        ),
        listOf(
            "Rửa cải và thái lát nấm.",
            "Phi tỏi, xào nấm đến khi mềm rồi thêm cải thìa.",
            "Nêm nước tương và đảo đến khi cọng cải vừa chín.",
        ),
    ),
    localRecipe(
        "fried-spring-rolls", "Nem rán", Fried, 55, 4, Hard,
        listOf(
            need("rice-paper", "12 lá"),
            need("minced-pork", "300 g"),
            need("wood-ear", "20 g"),
            need("vermicelli", "40 g"),
            need("carrots", "1 củ"),
            need("eggs", "1 quả"),
            need("oil", "250 ml"),
        ),
        listOf(
            "Ngâm mềm miến và mộc nhĩ, băm nhỏ rồi trộn với thịt, cà rốt và trứng.",
            "Cuốn nhân trong bánh tráng hơi ẩm, gấp hai đầu và cuộn vừa tay.",
            "Chiên từng mẻ đến khi vỏ vàng giòn và nhân chín hẳn, để ráo dầu.",
        ),
    ),
    localRecipe(
        "lemongrass-fried-fish", "Cá chiên sả ớt", Fried, 35, 3, Medium,
        listOf(
            need("tilapia", "1 con"),
            need("lemongrass", "2 cây"),
            need("chili", "1 quả"),
            need("salt", "1 thìa cà phê"),
            need("oil", "100 ml"),
        ),
        listOf(
            "Làm sạch, lau khô và khía mình cá.",
            "Ướp cá với sả, ớt băm và muối, gạt bớt sả để tránh cháy khi chiên.",
            "Chiên hai mặt đến khi cá chín, vớt ráo rồi rắc sả đã phi thơm.",
        ),
    ),
    localRecipe(
        "braised-pork-eggs", "Thịt kho trứng", Braised, 70, 4, Medium,
        listOf(
            need("pork-belly", "500 g"),
            need("duck-eggs", "4 quả"),
            need("coconut-water", "500 ml"),
            need("fish-sauce", "2 thìa canh"),
            need("sugar", "1 thìa canh"),
        ),
        listOf(
            "Luộc chín, bóc vỏ trứng; thái thịt miếng lớn.",
            "Thắng đường với ít nước, cho thịt vào đảo săn rồi thêm nước mắm và nước dừa.",
            "Kho lửa nhỏ đến khi thịt mềm, thêm trứng và kho tiếp cho thấm.",
        ),
    ),
    localRecipe(
        "claypot-fish", "Cá basa kho tộ", Braised, 45, 3, Medium,
        listOf(
            need("basa", "450 g"),
            need("fish-sauce", "2 thìa canh"),
            need("sugar", "1 thìa canh"),
            need("shallots", "2 củ"),
            need("pepper", "1 nhúm"),
        ),
        listOf(
            "Ướp cá với hành tím và nước mắm.",
            "Thắng đường, cho cá và ít nước nóng vào nồi rồi đun sôi.",
            "Kho lửa nhỏ đến khi cá chín và sốt sánh, rắc tiêu trước khi dùng.",
        ),
    ),
    localRecipe(
        "ginger-chicken", "Gà kho gừng", Braised, 40, 4, Medium,
        listOf(
            need("chicken", "600 g"),
            need("ginger", "40 g"),
            need("fish-sauce", "2 thìa canh"),
            need("sugar", "1 thìa cà phê"),
            need("oil", "1 thìa canh"),
        ),
        listOf(
            "Chặt gà vừa ăn, thái gừng sợi.",
            "Phi gừng rồi đảo gà đến khi săn, thêm nước mắm, đường và ít nước.",
            "Đậy nắp kho đến khi gà chín kỹ, mở nắp cho nước kho sệt lại.",
        ),
    ),
    localRecipe(
        "steamed-fish-ginger", "Cá hấp gừng", Steamed, 30, 3, Medium,
        listOf(
            need("carp", "600 g"),
            need("ginger", "40 g"),
            need("scallions", "30 g"),
            need("soy-sauce", "2 thìa canh"),
        ),
        listOf(
            "Làm sạch cá, khía thân rồi lót gừng dưới đĩa chịu nhiệt.",
            "Hấp cá đến khi thịt tách dễ bằng đũa và chín khắp.",
            "Rưới nước tương, thêm hành lá rồi hấp thêm một phút.",
        ),
    ),
    localRecipe(
        "steamed-eggs", "Trứng hấp thịt bằm", Steamed, 28, 3, Easy,
        listOf(
            need("eggs", "3 quả"),
            need("minced-pork", "120 g"),
            need("scallions", "15 g"),
            need("fish-sauce", "1 thìa cà phê"),
        ),
        listOf(
            "Đánh trứng với ít nước ấm và nước mắm rồi trộn thịt bằm.",
            "Đổ vào bát chịu nhiệt, đậy mặt bát để nước không nhỏ vào.",
            "Hấp lửa vừa đến khi trứng đông và thịt chín, rắc hành lá.",
        ),
    ),
    localRecipe(
        "lemongrass-steamed-clams", "Nghêu hấp sả", Steamed, 22, 3, Easy,
        listOf(
            need("clam", "700 g"),
            need("lemongrass", "3 cây"),
            need("ginger", "20 g"),
            need("chili", "1 quả"),
        ),
        listOf(
            "Rửa nghêu thật kỹ, bỏ con vỡ vỏ hoặc không khép khi chạm.",
            "Đập dập sả, thái gừng, cho vào nồi với ít nước và đun sôi.",
            "Cho nghêu vào, đậy nắp hấp đến khi mở vỏ, bỏ con còn khép.",
        ),
    ),
    localRecipe(
        "grilled-lemongrass-pork", "Thịt heo nướng sả", Grilled, 40, 4, Medium,
        listOf(
            need("pork", "500 g"),
            need("lemongrass", "3 cây"),
            need("fish-sauce", "1 thìa canh"),
            need("sugar", "1 thìa canh"),
            need("oil", "1 thìa canh"),
        ),
        listOf(
            "Thái thịt lát, ướp với sả băm, nước mắm, đường và dầu.",
            "Xếp thịt một lớp trên vỉ đã làm nóng rồi nướng hai mặt.",
            "Lấy thịt ra khi chín đều và có màu vàng nâu, để nghỉ vài phút.",
        ),
    ),
    localRecipe(
        "five-spice-grilled-chicken", "Đùi gà nướng ngũ vị", Grilled, 50, 4, Medium,
        listOf(
            need("chicken-thigh", "4 cái"),
            need("five-spice", "1 thìa cà phê"),
            need("soy-sauce", "2 thìa canh"),
            need("garlic", "3 tép"),
            need("sugar", "1 thìa cà phê"),
        ),
        listOf(
            "Khía đùi gà rồi ướp với ngũ vị, nước tương, tỏi và đường.",
            "Nướng trên khay ở 190 °C, lật giữa chừng để vàng đều.",
            "Kiểm tra phần dày nhất chín kỹ trước khi lấy ra.",
        ),
    ),
    localRecipe(
        "chili-grilled-shrimp", "Tôm nướng muối ớt", Grilled, 25, 3, Easy,
        listOf(
            need("shrimp", "450 g"),
            need("chili", "1 quả"),
            need("salt", "1 thìa cà phê"),
            need("oil", "1 thìa canh"),
            need("lime", "1 quả"),
        ),
        listOf(
            "Rửa tôm, bỏ chỉ lưng và thấm khô.",
            "Giã muối ớt, trộn dầu rồi phết lên tôm.",
            "Nướng hai mặt đến khi tôm đục màu và chín, vắt chanh khi dùng.",
        ),
    ),
    localRecipe(
        "boiled-chicken", "Gà luộc lá chanh", Boiled, 55, 4, Medium,
        listOf(
            need("chicken", "1 con"),
            need("ginger", "40 g"),
            need("shallots", "2 củ"),
            need("lime", "1 quả"),
            need("lime-leaves", "5 lá"),
            need("salt", "1 thìa cà phê"),
        ),
        listOf(
            "Cho gà vào nồi với gừng, hành đập dập, muối và nước ngập.",
            "Đun vừa sôi rồi hạ lửa, luộc đến khi phần dày nhất chín kỹ.",
            "Để gà ráo, chặt miếng, rắc lá chanh thái chỉ và dùng với muối chanh.",
        ),
    ),
    localRecipe(
        "boiled-bok-choy", "Cải thìa luộc", Boiled, 13, 2, Easy,
        listOf(
            need("bok-choy", "350 g"),
            need("salt", "1 nhúm"),
            need("soy-sauce", "1 thìa canh"),
        ),
        listOf(
            "Tách bẹ cải, rửa sạch từng bẹ rồi để ráo.",
            "Đun nước với chút muối, cho phần cọng vào trước rồi đến lá.",
            "Vớt cải ngay khi vừa chín và dùng với nước tương.",
        ),
    ),
    localRecipe(
        "boiled-chayote-carrot", "Su su và cà rốt luộc", Boiled, 20, 3, Easy,
        listOf(
            need("chayote", "2 quả"),
            need("carrots", "1 củ"),
            need("salt", "1 nhúm"),
            need("fish-sauce", "1 thìa canh"),
        ),
        listOf(
            "Gọt vỏ, thái su su và cà rốt miếng đều nhau.",
            "Luộc cà rốt trước, sau đó thêm su su và nấu đến khi cả hai vừa mềm.",
            "Vớt ráo và dọn cùng nước mắm.",
        ),
    ),
    localRecipe(
        "vegetarian-mushroom-tofu", "Đậu hũ kho nấm", Vegetarian, 30, 3, Easy,
        listOf(
            need("tofu", "350 g"),
            need("shiitake", "120 g"),
            need("soy-sauce", "2 thìa canh"),
            need("sugar", "1 thìa cà phê"),
            need("oil", "1 thìa canh"),
        ),
        listOf(
            "Cắt đậu hũ, thấm khô rồi áp chảo vàng nhẹ.",
            "Xào nấm, thêm nước tương, đường và ít nước.",
            "Cho đậu hũ vào, kho nhỏ lửa tới khi sốt bám đều.",
        ),
    ),
    localRecipe(
        "vegan-fresh-rolls", "Gỏi cuốn chay", Vegetarian, 30, 3, Easy,
        listOf(
            need("rice-paper", "10 lá"),
            need("tofu", "250 g"),
            need("rice-noodles", "200 g"),
            need("lettuce", "100 g"),
            need("cucumber", "1 quả"),
            need("peanuts", "30 g"),
            need("soy-sauce", "2 thìa canh"),
        ),
        listOf(
            "Áp chảo đậu, cắt dưa leo và rửa rau.",
            "Làm ẩm bánh tráng, xếp bún, rau, dưa và đậu rồi cuốn.",
            "Giã đậu phộng rang và khuấy cùng nước tương để làm nước chấm.",
        ),
    ),
    localRecipe(
        "mushroom-rice-porridge", "Cháo nấm", Vegetarian, 45, 3, Easy,
        listOf(
            need("rice", "120 g"),
            need("straw-mushroom", "150 g"),
            need("carrots", "1 củ"),
            need("scallions", "20 g"),
            need("salt", "1 thìa cà phê"),
        ),
        listOf(
            "Vo gạo rồi ninh với nước đến khi hạt nở.",
            "Thêm cà rốt thái hạt lựu và nấm đã rửa sạch.",
            "Nấu đến khi rau nấm chín, nêm muối và rắc hành lá.",
        ),
    ),
    localRecipe(
        "homestyle-beef-pho", "Phở bò tại nhà", NoodleSoup, 120, 4, Hard,
        listOf(
            need("beef", "600 g"),
            need("pho-noodles", "500 g"),
            need("ginger", "50 g"),
            need("onion", "1 củ"),
            need("fish-sauce", "2 thìa canh"),
            need("scallions", "30 g"),
        ),
        listOf(
            "Nướng thơm hành tây và gừng, ninh cùng thịt bò đến khi mềm, hớt bọt.",
            "Lấy thịt ra thái mỏng, lọc nước dùng và nêm nước mắm.",
            "Trụng bánh phở, xếp thịt và hành lá rồi chan nước dùng nóng.",
        ),
    ),
    localRecipe(
        "chicken-glass-noodles", "Miến gà", NoodleSoup, 50, 4, Medium,
        listOf(
            need("chicken", "650 g"),
            need("vermicelli", "250 g"),
            need("ginger", "30 g"),
            need("shiitake", "80 g"),
            need("scallions", "30 g"),
            need("fish-sauce", "1 thìa canh"),
        ),
        listOf(
            "Luộc gà với gừng đến khi chín, vớt ra xé thịt.",
            "Cho nấm vào nước luộc rồi nêm nước mắm.",
            "Ngâm, trụng miến theo hướng dẫn, thêm gà và hành rồi chan nước dùng.",
        ),
    ),
    localRecipe(
        "shrimp-noodle-soup", "Bún tôm cà chua", NoodleSoup, 35, 3, Medium,
        listOf(
            need("shrimp", "350 g"),
            need("rice-noodles", "450 g"),
            need("tomatoes", "2 quả"),
            need("shallots", "2 củ"),
            need("fish-sauce", "1 thìa canh"),
            need("scallions", "20 g"),
            need("oil", "1 thìa cà phê"),
        ),
        listOf(
            "Bóc tôm, bỏ chỉ và thái cà chua múi cau.",
            "Phi hành, xào cà chua rồi thêm nước; nấu tôm chín và nêm nước mắm.",
            "Chần bún, chia vào tô, chan nước dùng và rắc hành.",
        ),
    ),
    localRecipe(
        "sticky-rice-mung-bean", "Xôi đậu xanh", Breakfast, 50, 4, Medium,
        listOf(
            need("sticky-rice", "350 g"),
            need("mung-beans", "150 g"),
            need("salt", "1 nhúm"),
            need("coconut-milk", "70 ml"),
        ),
        listOf(
            "Ngâm gạo nếp và đậu xanh riêng vài giờ rồi để ráo.",
            "Trộn gạo với đậu và muối, hấp đến khi hạt nếp trong và đậu mềm.",
            "Rưới cốt dừa, xới nhẹ và hấp thêm vài phút.",
        ),
    ),
    localRecipe(
        "egg-banh-mi", "Bánh mì trứng ốp la", Breakfast, 12, 2, Easy,
        listOf(
            need("bread", "2 ổ"),
            need("eggs", "2 quả"),
            need("cucumber", "1 quả"),
            need("soy-sauce", "2 thìa cà phê"),
            need("oil", "1 thìa cà phê"),
        ),
        listOf(
            "Làm nóng bánh mì, cắt dưa leo thành lát.",
            "Chiên trứng trên chảo ít dầu đến khi chín theo khẩu vị.",
            "Kẹp trứng và dưa vào bánh, nêm nước tương rồi dùng ngay.",
        ),
    ),
    localRecipe(
        "lotus-chicken-porridge", "Cháo gà hạt sen", Breakfast, 55, 4, Medium,
        listOf(
            need("rice", "150 g"),
            need("chicken", "450 g"),
            need("lotus-seeds", "100 g"),
            need("ginger", "20 g"),
            need("scallions", "20 g"),
        ),
        listOf(
            "Luộc gà với gừng đến khi chín, vớt ra xé thịt.",
            "Ninh gạo và hạt sen trong nước luộc đến khi mềm.",
            "Cho gà trở lại nồi, đun nóng đều và rắc hành lá.",
        ),
    ),
    localRecipe(
        "egg-fried-rice", "Cơm chiên trứng", QuickMeal, 15, 2, Easy,
        listOf(
            need("rice", "300 g cơm chín"),
            need("eggs", "2 quả"),
            need("carrots", "1 củ"),
            need("scallions", "15 g"),
            need("soy-sauce", "1 thìa canh"),
            need("oil", "1 thìa canh"),
        ),
        listOf(
            "Tách tơi cơm đã nấu, thái hạt lựu cà rốt và cắt hành.",
            "Xào cà rốt, cho trứng vào đảo rồi thêm cơm.",
            "Rang đến khi cơm nóng đều, nêm nước tương và rắc hành lá.",
        ),
    ),
    localRecipe(
        "stirred-noodles-vegetables", "Mì trộn rau củ", QuickMeal, 18, 2, Easy,
        listOf(
            need("egg-noodles", "200 g"),
            need("carrots", "1 củ"),
            need("cucumber", "1 quả"),
            need("soy-sauce", "2 thìa canh"),
            need("lime", "1 quả"),
            need("sesame", "1 thìa cà phê"),
        ),
        listOf(
            "Luộc mì theo hướng dẫn, xả nhanh và để ráo.",
            "Thái cà rốt, dưa leo thành sợi; pha nước tương với chanh.",
            "Trộn mì cùng rau và nước sốt, rắc mè trước khi dùng.",
        ),
    ),
    localRecipe(
        "avocado-yogurt-toast", "Bánh mì bơ và sữa chua", QuickMeal, 10, 2, Easy,
        listOf(
            need("bread", "4 lát"),
            need("avocado", "1 quả"),
            need("yogurt", "80 g"),
            need("lime", "1/2 quả"),
        ),
        listOf(
            "Nướng nhẹ bánh mì. Nghiền bơ với ít nước chanh.",
            "Phết bơ lên bánh, thêm một lớp sữa chua và dùng ngay.",
        ),
    ),
    localRecipe(
        "lemongrass-chicken", "Gà xào sả ớt", Family, 32, 4, Medium,
        listOf(
            need("chicken", "600 g"),
            need("lemongrass", "3 cây"),
            need("chili", "1 quả"),
            need("fish-sauce", "2 thìa canh"),
            need("oil", "1 thìa canh"),
        ),
        listOf(
            "Chặt gà miếng vừa, băm sả và ớt.",
            "Phi sả, cho gà vào đảo săn rồi nêm nước mắm.",
            "Thêm ít nước, đảo trên lửa vừa đến khi gà chín kỹ và cạn sốt.",
        ),
    ),
    localRecipe(
        "stuffed-bitter-melon", "Khổ qua nhồi thịt", Family, 45, 4, Medium,
        listOf(
            need("bitter-melon", "3 quả"),
            need("minced-pork", "280 g"),
            need("wood-ear", "15 g"),
            need("scallions", "25 g"),
            need("fish-sauce", "1 thìa canh"),
        ),
        listOf(
            "Cắt khổ qua thành khúc, bỏ ruột. Ngâm và thái mộc nhĩ.",
            "Trộn thịt với mộc nhĩ, hành và nước mắm rồi nhồi vào khổ qua.",
            "Thả vào nước sôi, hạ lửa và nấu đến khi khổ qua mềm, nhân chín.",
        ),
    ),
    localRecipe(
        "sweet-sour-ribs", "Sườn xào chua ngọt", Family, 45, 4, Medium,
        listOf(
            need("pork-ribs", "600 g"),
            need("sugar", "2 thìa canh"),
            need("vinegar", "2 thìa canh"),
            need("fish-sauce", "1 thìa canh"),
            need("garlic", "3 tép"),
            need("oil", "1 thìa canh"),
        ),
        listOf(
            "Chặt sườn miếng nhỏ, chần qua rồi thấm khô.",
            "Áp chảo sườn cho vàng. Pha giấm, đường, nước mắm và ít nước.",
            "Phi tỏi, thêm sườn và sốt, rim đến khi thịt chín mềm và sốt bám đều.",
        ),
    ),
    localRecipe(
        "banana-coconut-dessert", "Chè chuối nước cốt dừa", Dessert, 30, 4, Easy,
        listOf(
            need("banana", "5 quả"),
            need("coconut-milk", "300 ml"),
            need("tapioca", "30 g"),
            need("sugar", "40 g"),
            need("peanuts", "30 g"),
        ),
        listOf(
            "Cắt chuối miếng dày, hòa bột năng với ít nước lạnh.",
            "Nấu cốt dừa với đường, thêm chuối và đun đến khi mềm.",
            "Rót bột năng vào từ từ, khuấy sánh và rắc đậu phộng rang.",
        ),
    ),
    localRecipe(
        "black-bean-dessert", "Chè đậu đen", Dessert, 75, 5, Easy,
        listOf(
            need("black-beans", "250 g"),
            need("sugar", "120 g"),
            need("coconut-milk", "150 ml"),
            need("salt", "1 nhúm"),
        ),
        listOf(
            "Ngâm đậu đen vài giờ, rửa lại rồi ninh đến khi hạt mềm.",
            "Thêm đường, đun nhỏ lửa cho thấm. Làm ấm cốt dừa với chút muối.",
            "Múc chè ra bát, thêm cốt dừa và dùng nóng hoặc lạnh.",
        ),
    ),
    localRecipe(
        "mango-yogurt", "Sữa chua xoài", Dessert, 10, 2, Easy,
        listOf(
            need("mango", "1 quả"),
            need("yogurt", "250 g"),
            need("condensed-milk", "1 thìa canh"),
        ),
        listOf(
            "Gọt xoài, cắt một nửa hạt lựu và nghiền phần còn lại.",
            "Trộn xoài nghiền với sữa chua và sữa đặc.",
            "Chia vào ly, phủ xoài hạt lựu và dùng lạnh.",
        ),
    ),
    localRecipe(
        "green-papaya-salad", "Gỏi đu đủ tôm", Salad, 30, 3, Medium,
        listOf(
            need("papaya", "350 g xanh"),
            need("shrimp", "250 g"),
            need("carrots", "1 củ"),
            need("lime", "1 quả"),
            need("fish-sauce", "1 thìa canh"),
            need("peanuts", "30 g"),
        ),
        listOf(
            "Bào đu đủ xanh và cà rốt, rửa sạch rồi vắt ráo.",
            "Luộc tôm chín, bóc vỏ và pha nước mắm với nước chanh.",
            "Trộn rau với tôm và nước trộn, rắc đậu phộng ngay trước khi ăn.",
        ),
    ),
    localRecipe(
        "lotus-root-salad", "Gỏi củ sen tôm", Salad, 35, 3, Medium,
        listOf(
            need("lotus-root", "300 g"),
            need("shrimp", "200 g"),
            need("carrots", "1 củ"),
            need("lime", "1 quả"),
            need("fish-sauce", "1 thìa canh"),
            need("coriander", "20 g"),
        ),
        listOf(
            "Gọt và thái lát củ sen, chần đến khi vừa chín rồi để ráo.",
            "Luộc tôm, bỏ vỏ, bào sợi cà rốt và pha nước mắm chanh.",
            "Trộn củ sen, cà rốt và tôm với nước trộn, thêm ngò rí.",
        ),
    ),
    localRecipe(
        "chicken-cabbage-salad", "Gỏi gà bắp cải", Salad, 35, 4, Easy,
        listOf(
            need("chicken-breast", "350 g"),
            need("cabbage", "300 g"),
            need("carrots", "1 củ"),
            need("lime", "1 quả"),
            need("fish-sauce", "1 thìa canh"),
            need("peanuts", "30 g"),
        ),
        listOf(
            "Luộc ức gà chín kỹ, để nguội rồi xé sợi.",
            "Thái bắp cải, bào cà rốt và pha nước mắm chanh.",
            "Trộn thịt gà với rau, thêm nước trộn và rắc đậu phộng rang.",
        ),
    ),
)

private fun need(id: String, amount: String) = RecipeIngredient(catalogIngredient(id).name, amount)

private fun localRecipe(
    id: String,
    title: String,
    category: RecipeCategory,
    minutes: Int,
    servings: Int,
    difficulty: RecipeDifficulty,
    ingredients: List<RecipeIngredient>,
    steps: List<String>,
) = Recipe(
    id = id,
    title = title,
    author = if (category in familyKitchenCategories) "Bếp nhà An" else "Bếp CookMate",
    category = category,
    difficulty = difficulty,
    minutes = minutes,
    servings = servings,
    ingredients = ingredients,
    steps = steps,
    followedAuthor = category !in familyKitchenCategories,
)
