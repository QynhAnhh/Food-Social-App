package com.foodsocial.app.navigation

import androidx.compose.foundation.layout.*
import androidx.compose.material3.*
import androidx.compose.runtime.*
import androidx.compose.runtime.saveable.rememberSaveable
import androidx.compose.ui.Modifier
import androidx.compose.ui.platform.LocalDensity
import androidx.compose.ui.unit.Density
import androidx.compose.ui.unit.dp
import androidx.lifecycle.viewmodel.compose.viewModel
import androidx.navigation.NavHostController
import androidx.navigation.NavType
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import androidx.navigation.compose.currentBackStackEntryAsState
import androidx.navigation.compose.rememberNavController
import androidx.navigation.navArgument
import com.foodsocial.app.core.designsystem.CookMateBottomBar
import com.foodsocial.app.core.designsystem.RecipeEmpty
import com.foodsocial.app.core.designsystem.RecipeHeader
import com.foodsocial.app.data.local.sampleRecipes
import com.foodsocial.app.data.local.sampleIngredients
import com.foodsocial.app.domain.model.Recipe
import com.foodsocial.app.domain.model.RecipeCategory
import com.foodsocial.app.domain.model.ShoppingItem
import com.foodsocial.app.domain.model.ingredientKey
import com.foodsocial.app.domain.model.startOfDiaryDay
import com.foodsocial.app.domain.model.toShoppingItem
import com.foodsocial.app.features.auth.LoginScreen
import com.foodsocial.app.features.auth.OnboardingScreen
import com.foodsocial.app.features.auth.SplashScreen
import com.foodsocial.app.features.feed.HomeScreen
import com.foodsocial.app.features.feed.HomeRecipeSection
import com.foodsocial.app.features.feed.RecipeCategoriesScreen
import com.foodsocial.app.features.food_diary.FoodDiaryScreen
import com.foodsocial.app.features.notification.NotificationScreen
import com.foodsocial.app.features.notification.NotificationTarget
import com.foodsocial.app.features.notification.sampleNotifications
import com.foodsocial.app.features.profile.EditProfileScreen
import com.foodsocial.app.features.profile.FavoriteRecipesScreen
import com.foodsocial.app.features.profile.MyRecipesScreen
import com.foodsocial.app.features.profile.ProfileSetupScreen
import com.foodsocial.app.features.profile.ProfileScreen
import com.foodsocial.app.features.profile.SampleAvatar
import com.foodsocial.app.features.recipe_detail.CookingGuideScreen
import com.foodsocial.app.features.recipe_detail.RecipeDetailScreen
import com.foodsocial.app.features.recipe_creation.RecipeCreationScreen
import com.foodsocial.app.features.recipe_creation.RecipeDraft
import com.foodsocial.app.features.recipe_creation.RecipePreviewScreen
import com.foodsocial.app.features.search_filter.SearchScreen
import com.foodsocial.app.features.settings.SettingsScreen
import com.foodsocial.app.features.shopping_list.ShoppingListScreen
import com.foodsocial.app.features.smart_fridge.FridgeInventory
import com.foodsocial.app.features.smart_fridge.IngredientManagementScreen
import com.foodsocial.app.features.smart_fridge.RecipeRecommendationsScreen
import com.foodsocial.app.features.smart_fridge.SmartFridgeScreen
import com.foodsocial.app.features.utilities.PersonalCookingState
import com.foodsocial.app.features.utilities.UtilitiesScreen
import kotlinx.coroutines.launch
import java.math.BigDecimal
import java.util.UUID

private const val RecipeId = "recipeId"
private const val CategoryName = "categoryName"
private const val SectionName = "sectionName"
private const val Following = "following"
private const val SourceTab = "sourceTab"
private const val DiaryEntryId = "entryId"
private val recipeDetailRoute = "${AppDestination.RecipeDetail.route}/{$RecipeId}?tab={$SourceTab}"
private val cookingGuideRoute = "${AppDestination.CookingGuide.route}/{$RecipeId}?tab={$SourceTab}"
private val foodDiaryRoute = "${AppDestination.FoodDiary.route}?entry={$DiaryEntryId}"

@Composable
internal fun AppNavHost(personal: PersonalCookingState = viewModel()) {
    var largeText by rememberSaveable { mutableStateOf(false) }
    val deviceDensity = LocalDensity.current
    val appDensity = remember(deviceDensity, largeText) {
        if (largeText) Density(deviceDensity.density, deviceDensity.fontScale * 1.15f) else deviceDensity
    }
    CompositionLocalProvider(LocalDensity provides appDensity) {
        CookMateNavigation(personal, largeText) { largeText = it }
    }
}

@Composable
private fun CookMateNavigation(
    personal: PersonalCookingState,
    largeText: Boolean,
    onLargeText: (Boolean) -> Unit,
) {
    val navController = rememberNavController()
    val currentEntry by navController.currentBackStackEntryAsState()
    val route = currentEntry?.destination?.route
    val current = AppDestination.bottomBarItems.firstOrNull { it.route == route }
    val bottomSelection = current ?: when (route) {
        recipeDetailRoute, cookingGuideRoute -> AppDestination.bottomBarItems.firstOrNull {
            it.route == currentEntry?.arguments?.getString(SourceTab)
        } ?: AppDestination.Home
        AppDestination.FridgeManagement.route, AppDestination.Recommendations.route -> AppDestination.Fridge
        foodDiaryRoute, AppDestination.ShoppingList.route -> AppDestination.Utilities
        AppDestination.MyRecipes.route, AppDestination.EditProfile.route,
        AppDestination.Notifications.route, AppDestination.Settings.route -> AppDestination.Profile
        else -> null
    }
    var displayName by rememberSaveable { mutableStateOf<String?>(null) }
    var guestDisplayName by rememberSaveable { mutableStateOf<String?>(null) }
    var avatar by rememberSaveable { mutableStateOf(SampleAvatar.Chef) }
    val guest = displayName == null
    val profileName = displayName ?: guestDisplayName
    val notificationSamples = remember { sampleNotifications() }
    var readNotifications by rememberSaveable { mutableStateOf(arrayListOf<String>()) }
    var clearedNotifications by rememberSaveable { mutableStateOf(arrayListOf<String>()) }
    val notifications = notificationSamples.filterNot { it.id in clearedNotifications }
    var favoriteIds by rememberSaveable { mutableStateOf(arrayListOf<String>()) }
    var fridge by rememberSaveable(stateSaver = FridgeInventory.saver) {
        mutableStateOf(FridgeInventory())
    }
    val favorites = favoriteIds.toSet()
    val allRecipes = remember(personal.recipes) { sampleRecipes + personal.recipes }
    val recipesById = remember(allRecipes) { allRecipes.associateBy(Recipe::id) }
    var afterDiscard by remember { mutableStateOf<(() -> Unit)?>(null) }
    val snackbar = remember { SnackbarHostState() }
    val scope = rememberCoroutineScope()

    fun notify(message: String) {
        snackbar.currentSnackbarData?.dismiss()
        scope.launch { snackbar.showSnackbar(message) }
    }

    fun toggleFavorite(recipe: Recipe) {
        val saved = recipe.id !in favoriteIds
        favoriteIds = ArrayList(
            if (saved) favoriteIds + recipe.id else favoriteIds - recipe.id,
        )
        notify(if (saved) "Đã lưu ${recipe.title}" else "Đã bỏ lưu ${recipe.title}")
    }

    fun openRecipe(recipe: Recipe, source: AppDestination = AppDestination.Home) {
        navController.navigate("${AppDestination.RecipeDetail.route}/${recipe.id}?tab=${source.route}") {
            launchSingleTop = true
        }
    }

    fun openCategory(category: RecipeCategory) {
        navController.navigate("${AppDestination.CategoryRecipes.route}/${category.name}") {
            launchSingleTop = true
        }
    }

    fun switchTab(destination: AppDestination) {
        if (destination.route == navController.currentDestination?.route) return
        if (destination == AppDestination.Home) {
            navController.popBackStack(destination.route, inclusive = false, saveState = true)
            return
        }
        if (destination == bottomSelection && navController.popBackStack(destination.route, inclusive = false)) return
        navController.navigate(destination.route) {
            popUpTo(AppDestination.Home.route) { saveState = true }
            launchSingleTop = true
            restoreState = true
        }
    }

    fun leaveDraft(onLeave: () -> Unit) {
        if (personal.draft.isDirty) {
            afterDiscard = onLeave
        } else {
            onLeave()
        }
    }

    fun openTab(destination: AppDestination) {
        if (navController.currentDestination?.route == AppDestination.Create.route && destination != AppDestination.Create) {
            leaveDraft {
                navController.popBackStack()
                switchTab(destination)
            }
        } else {
            switchTab(destination)
        }
    }

    fun openDiary() {
        if (navController.previousBackStackEntry?.destination?.route == foodDiaryRoute) {
            navController.popBackStack()
        } else {
            navController.open(AppDestination.FoodDiary)
        }
    }

    fun enterHome(name: String?) {
        displayName = name
        navController.replaceFrom(AppDestination.Login, AppDestination.Home)
    }

    fun returnToLogin() {
        AppDestination.bottomBarItems.forEach { navController.clearBackStack(it.route) }
        navController.replaceFrom(AppDestination.Home, AppDestination.Login)
    }

    fun signOut() {
        displayName = null
        guestDisplayName = null
        avatar = SampleAvatar.Chef
        favoriteIds = arrayListOf()
        fridge = FridgeInventory()
        personal.reset()
        readNotifications = arrayListOf()
        clearedNotifications = arrayListOf()
        returnToLogin()
    }

    fun markRead(id: String) {
        if (id !in readNotifications) readNotifications = ArrayList(readNotifications + id)
    }

    Scaffold(
        contentWindowInsets = when (route) {
            null, AppDestination.Splash.route, AppDestination.Onboarding.route,
            AppDestination.Login.route, AppDestination.ProfileSetup.route -> WindowInsets(0, 0, 0, 0)
            else -> ScaffoldDefaults.contentWindowInsets
        },
        snackbarHost = { SnackbarHost(snackbar) },
        bottomBar = {
            if (bottomSelection != null) CookMateBottomBar(bottomSelection, ::openTab)
        },
    ) { padding ->
        NavHost(
            navController = navController,
            startDestination = AppDestination.Splash.route,
            modifier = Modifier.fillMaxSize().padding(padding).consumeWindowInsets(padding),
        ) {
            composable(AppDestination.Splash.route) {
                SplashScreen { navController.replaceFrom(AppDestination.Splash, AppDestination.Onboarding) }
            }
            composable(AppDestination.Onboarding.route) {
                OnboardingScreen { navController.replaceFrom(AppDestination.Onboarding, AppDestination.Login) }
            }
            composable(AppDestination.Login.route) {
                LoginScreen(
                    onGoogleLoginClick = { navController.open(AppDestination.ProfileSetup) },
                    onGuestClick = { enterHome(null) },
                )
            }
            composable(AppDestination.ProfileSetup.route) {
                ProfileSetupScreen(onComplete = ::enterHome, onBack = { navController.popBackStack() })
            }
            composable(AppDestination.Home.route) {
                HomeScreen(
                    displayName = profileName,
                    recipes = sampleRecipes,
                    favorites = favorites,
                    onOpenFridge = { openTab(AppDestination.Fridge) },
                    onSearch = { navController.open(AppDestination.Search) },
                    onFilter = { navController.open(AppDestination.SearchFilters) },
                    onCategories = { navController.open(AppDestination.Categories) },
                    onCategory = ::openCategory,
                    onSection = { section, following ->
                        navController.navigate("${AppDestination.HomeSection.route}/${section.name}/$following") {
                            launchSingleTop = true
                        }
                    },
                    onOpenRecipe = { openRecipe(it) },
                    onToggleFavorite = ::toggleFavorite,
                )
            }
            composable(AppDestination.Categories.route) {
                RecipeCategoriesScreen(sampleRecipes, onBack = { navController.popBackStack() }, onCategory = ::openCategory)
            }
            composable(AppDestination.Search.route) {
                SearchScreen(sampleRecipes, favorites, null, false, { navController.popBackStack() }, { openRecipe(it) }, ::toggleFavorite)
            }
            composable(AppDestination.SearchFilters.route) {
                SearchScreen(sampleRecipes, favorites, null, true, { navController.popBackStack() }, { openRecipe(it) }, ::toggleFavorite)
            }
            composable("${AppDestination.CategoryRecipes.route}/{$CategoryName}") { entry ->
                val category = RecipeCategory.entries.firstOrNull { it.name == entry.arguments?.getString(CategoryName) }
                val recipes = remember(category) { sampleRecipes.filter { it.category == category } }
                SearchScreen(recipes, favorites, null, false, { navController.popBackStack() }, { openRecipe(it) }, ::toggleFavorite,
                    title = category?.label ?: AppDestination.CategoryRecipes.title)
            }
            composable("${AppDestination.HomeSection.route}/{$SectionName}/{$Following}") { entry ->
                val section = HomeRecipeSection.entries.firstOrNull { it.name == entry.arguments?.getString(SectionName) }
                val following = entry.arguments?.getString(Following) == "true"
                val recipes = remember(section, following) { section?.recipesFrom(sampleRecipes, following).orEmpty() }
                SearchScreen(recipes, favorites, null, false, { navController.popBackStack() }, { openRecipe(it) }, ::toggleFavorite,
                    title = section?.title ?: AppDestination.HomeSection.title)
            }
            composable(recipeDetailRoute) { entry ->
                val recipe = recipesById[entry.arguments?.getString(RecipeId)]
                if (recipe == null) {
                    MissingRecipe { navController.popBackStack() }
                } else {
                    RecipeDetailScreen(
                        recipe = recipe,
                        saved = recipe.id in favorites,
                        onBack = { navController.popBackStack() },
                        onToggleFavorite = { toggleFavorite(recipe) },
                        onStartCooking = {
                            val source = entry.arguments?.getString(SourceTab) ?: AppDestination.Home.route
                            navController.navigate("${AppDestination.CookingGuide.route}/${recipe.id}?tab=$source") {
                                launchSingleTop = true
                            }
                        },
                        inDiaryToday = personal.diary.any { it.recipeId == recipe.id && it.cookedAt >= startOfDiaryDay() },
                        onDiary = {
                            if (personal.addDiary(recipe)) notify("Đã thêm ${recipe.title} vào nhật ký")
                            openDiary()
                        },
                        onShopping = {
                            personal.addShopping(recipe.ingredients.map { it.toShoppingItem() })
                            navController.open(AppDestination.ShoppingList)
                            notify("Đã thêm nguyên liệu vào danh sách mua sắm")
                        },
                    )
                }
            }
            composable(cookingGuideRoute) { entry ->
                val recipe = recipesById[entry.arguments?.getString(RecipeId)]
                if (recipe == null) {
                    MissingRecipe { navController.popBackStack() }
                } else {
                    CookingGuideScreen(recipe, onBack = { navController.popBackStack() })
                }
            }
            composable(AppDestination.Favorites.route) {
                FavoriteRecipesScreen(
                    allRecipes, favorites, { navController.popBackStack() },
                    { openRecipe(it, AppDestination.Profile) }, ::toggleFavorite,
                )
            }
            composable(AppDestination.Fridge.route) {
                SmartFridgeScreen(
                    inventory = fridge,
                    catalog = sampleIngredients,
                    onAdd = { ingredient ->
                        val name = ingredientKey(ingredient.name)
                        if (fridge.ingredients.none { ingredientKey(it.name) == name }) {
                            fridge = fridge.upsert(ingredient.copy(id = UUID.randomUUID().toString()))
                            notify("Đã thêm ${ingredient.name}")
                        }
                    },
                    onToggle = { fridge = fridge.toggle(it) },
                    onManage = { navController.open(AppDestination.FridgeManagement) },
                    onRecommend = { navController.open(AppDestination.Recommendations) },
                    onShopping = {
                        personal.addShopping(fridge.selected.map { ShoppingItem(it.name, BigDecimal.ONE, "") })
                        navController.open(AppDestination.ShoppingList)
                        notify("Đã thêm nguyên liệu đã chọn")
                    },
                )
            }
            composable(AppDestination.FridgeManagement.route) {
                IngredientManagementScreen(
                    ingredients = fridge.ingredients,
                    onBack = { navController.popBackStack() },
                    onSave = { ingredient ->
                        val existing = fridge.ingredients.any { it.id == ingredient.id }
                        fridge = fridge.upsert(ingredient)
                        notify(if (existing) "Đã cập nhật ${ingredient.name}" else "Đã thêm ${ingredient.name}")
                    },
                    onRemove = {
                        fridge = fridge.remove(it)
                        notify("Đã xóa ${it.name}")
                    },
                )
            }
            composable(AppDestination.Recommendations.route) {
                RecipeRecommendationsScreen(
                    recipes = sampleRecipes,
                    selected = fridge.selected,
                    favorites = favorites,
                    onBack = { navController.popBackStack() },
                    onOpenRecipe = { openRecipe(it, AppDestination.Fridge) },
                    onToggleFavorite = ::toggleFavorite,
                )
            }
            composable(AppDestination.Create.route) {
                RecipeCreationScreen(
                    draft = personal.draft,
                    photoChoices = sampleRecipes,
                    onChange = { personal.draft = it },
                    onBack = { leaveDraft { navController.popBackStack() } },
                    onPreview = { navController.open(AppDestination.RecipePreview) },
                )
            }
            composable(AppDestination.RecipePreview.route) {
                val author = profileName ?: "Bếp của tôi"
                val preview = personal.draft.toRecipe("draft-preview", author)
                if (preview == null) {
                    MissingRecipe { navController.popBackStack() }
                } else {
                    RecipePreviewScreen(preview, onBack = { navController.popBackStack() }, onSave = {
                        if (personal.saveRecipe(author) != null) {
                            if (!navController.popBackStack(AppDestination.MyRecipes.route, inclusive = false)) {
                                navController.popBackStack(AppDestination.Home.route, inclusive = false)
                                switchTab(AppDestination.Profile)
                                if (navController.currentDestination?.route != AppDestination.Profile.route) {
                                    navController.popBackStack(AppDestination.Profile.route, inclusive = false)
                                }
                                navController.open(AppDestination.MyRecipes)
                            }
                            notify("Đã lưu công thức")
                        }
                    })
                }
            }
            composable(AppDestination.MyRecipes.route) {
                MyRecipesScreen(
                    recipes = personal.recipes,
                    favorites = favorites,
                    onBack = { navController.popBackStack() },
                    onCreate = { navController.open(AppDestination.Create) },
                    onOpen = { openRecipe(it, AppDestination.Profile) },
                    onToggle = ::toggleFavorite,
                )
            }
            composable(AppDestination.Utilities.route) {
                UtilitiesScreen(
                    onDiary = { navController.open(AppDestination.FoodDiary) },
                    onShopping = { navController.open(AppDestination.ShoppingList) },
                )
            }
            composable(
                foodDiaryRoute,
                arguments = listOf(navArgument(DiaryEntryId) {
                    type = NavType.StringType
                    nullable = true
                    defaultValue = null
                }),
            ) { entry ->
                FoodDiaryScreen(
                    entries = personal.diary,
                    recipes = recipesById,
                    onBack = { navController.popBackStack() },
                    onOpen = { openRecipe(it, AppDestination.Utilities) },
                    onRemove = {
                        personal.removeDiary(it)
                        notify("Đã xóa mục nhật ký")
                    },
                    initialEntryId = entry.arguments?.getString(DiaryEntryId),
                )
            }
            composable(AppDestination.ShoppingList.route) {
                ShoppingListScreen(
                    shopping = personal.shopping,
                    onBack = { navController.popBackStack() },
                    onSave = {
                        personal.saveShopping(it)
                        notify("Đã lưu mục mua sắm")
                    },
                    onToggle = personal::toggleShopping,
                    onRemove = {
                        personal.removeShopping(it)
                        notify("Đã xóa mục mua sắm")
                    },
                )
            }
            composable(AppDestination.Profile.route) {
                ProfileScreen(
                    displayName = profileName ?: "Khách CookMate",
                    guest = guest,
                    avatar = avatar,
                    favoriteCount = favorites.size,
                    recipeCount = personal.recipes.size,
                    unreadCount = notifications.count { it.id !in readNotifications },
                    onEdit = { navController.open(AppDestination.EditProfile) },
                    onRecipes = { navController.open(AppDestination.MyRecipes) },
                    onFavorites = { navController.open(AppDestination.Favorites) },
                    onNotifications = { navController.open(AppDestination.Notifications) },
                    onSettings = { navController.open(AppDestination.Settings) },
                    onLogin = ::returnToLogin,
                )
            }
            composable(AppDestination.EditProfile.route) {
                EditProfileScreen(
                    initialName = profileName.orEmpty(),
                    initialAvatar = avatar,
                    onBack = { navController.popBackStack() },
                    onSave = { name, newAvatar ->
                        if (guest) guestDisplayName = name else displayName = name
                        avatar = newAvatar
                        navController.popBackStack()
                        notify("Đã cập nhật hồ sơ")
                    },
                )
            }
            composable(AppDestination.Notifications.route) {
                NotificationScreen(
                    notifications = notifications,
                    readIds = readNotifications.toSet(),
                    isTargetAvailable = { target ->
                        when (target) {
                            is NotificationTarget.Recipe -> target.recipeId in recipesById
                            is NotificationTarget.Diary -> personal.diary.any { it.id == target.entryId }
                        }
                    },
                    onBack = { navController.popBackStack() },
                    onRead = { markRead(it.id) },
                    onOpen = { notification ->
                        markRead(notification.id)
                        when (val target = notification.target) {
                            is NotificationTarget.Recipe -> recipesById[target.recipeId]?.let {
                                openRecipe(it, AppDestination.Profile)
                            }
                            is NotificationTarget.Diary -> if (personal.diary.any { it.id == target.entryId }) {
                                navController.navigate("${AppDestination.FoodDiary.route}?entry=${target.entryId}") {
                                    launchSingleTop = true
                                }
                            }
                            null -> Unit
                        }
                    },
                    onReadAll = {
                        readNotifications = ArrayList((readNotifications + notifications.map { it.id }).distinct())
                    },
                    onClearRead = {
                        clearedNotifications = ArrayList((clearedNotifications + readNotifications).distinct())
                    },
                )
            }
            composable(AppDestination.Settings.route) {
                SettingsScreen(
                    guest = guest,
                    largeText = largeText,
                    onLargeText = onLargeText,
                    onBack = { navController.popBackStack() },
                    onLogin = ::returnToLogin,
                    onSignOut = ::signOut,
                )
            }
        }
    }

    afterDiscard?.let { onLeave ->
        AlertDialog(
            onDismissRequest = { afterDiscard = null },
            title = { Text("Bỏ công thức chưa lưu?") },
            text = { Text("Nội dung bạn đã nhập sẽ bị mất khi rời màn này.") },
            dismissButton = { TextButton(onClick = { afterDiscard = null }) { Text("Tiếp tục sửa") } },
            confirmButton = {
                TextButton(onClick = {
                    afterDiscard = null
                    personal.draft = RecipeDraft()
                    onLeave()
                }) { Text("Bỏ thay đổi") }
            },
        )
    }
}

private fun NavHostController.open(destination: AppDestination) {
    navigate(destination.route) { launchSingleTop = true }
}

private fun NavHostController.replaceFrom(source: AppDestination, target: AppDestination) {
    navigate(target.route) {
        popUpTo(source.route) { inclusive = true }
        launchSingleTop = true
    }
}

@Composable
private fun MissingRecipe(onBack: () -> Unit) {
    Column(Modifier.fillMaxSize().padding(16.dp)) {
        RecipeHeader("Công thức", onBack)
        RecipeEmpty("Không tìm thấy công thức", "Quay lại danh sách để chọn một món khác.")
    }
}
