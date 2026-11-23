package com.foodsocial.app.navigation

internal enum class AppDestination(val route: String, val title: String) {
    Splash("splash", "Khởi động"),
    Onboarding("onboarding", "Giới thiệu"),
    Login("login", "Đăng nhập"),
    ProfileSetup("profile-setup", "Thiết lập hồ sơ"),
    Home("home", "Trang chủ"),
    Fridge("fridge", "Tủ lạnh"),
    FridgeManagement("fridge-management", "Quản lý nguyên liệu"),
    Recommendations("recipe-recommendations", "Món ăn phù hợp"),
    Create("create", "Tạo công thức"),
    Utilities("utilities", "Tiện ích"),
    FoodDiary("food-diary", "Nhật ký món ăn"),
    ShoppingList("shopping-list", "Danh sách mua sắm"),
    RecipePreview("recipe-preview", "Xem trước công thức"),
    MyRecipes("my-recipes", "Công thức của tôi"),
    Profile("profile", "Hồ sơ"),
    EditProfile("edit-profile", "Chỉnh sửa hồ sơ"),
    Notifications("notifications", "Thông báo"),
    Settings("settings", "Cài đặt"),
    Categories("categories", "Danh mục món ăn"),
    Search("recipe-search", "Tìm công thức"),
    SearchFilters("recipe-search-filters", "Lọc công thức"),
    CategoryRecipes("category-recipes", "Công thức theo danh mục"),
    HomeSection("home-section", "Nhóm món ăn"),
    RecipeDetail("recipe-detail", "Chi tiết món ăn"),
    CookingGuide("cooking-guide", "Hướng dẫn nấu"),
    Favorites("favorites", "Món yêu thích");

    companion object {
        val bottomBarItems = listOf(Home, Fridge, Create, Utilities, Profile)
    }
}
