import { Response } from 'express';
import { prisma } from '../../config/prisma';
import { AuthRequest } from '../../common/middlewares/auth.middleware';

// get /api/v1/search - tìm kiếm toàn cục (global search) cho 2 tab công thức & người dùng
export const globalSearch = async (req: AuthRequest, res: Response) => {
  const q = String(req.query.q || req.query.keyword || '').trim();
  const type = String(req.query.type || 'all').toLowerCase();
  const page = Math.max(Number(req.query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(req.query.limit) || 10, 1), 50);
  const skip = (page - 1) * limit;

  if (!q) {
    return res.status(200).json({
      success: true,
      message: 'Vui lòng cung cấp từ khóa tìm kiếm',
      data: {
        keyword: '',
        recipes: { items: [], total: 0, page, totalPages: 0 },
        users: { items: [], total: 0, page, totalPages: 0 },
      },
    });
  }

  let recipesResult: any = { items: [], total: 0, page, totalPages: 0 };
  let usersResult: any = { items: [], total: 0, page, totalPages: 0 };

  // tìm kiếm công thức (recipes)
  if (type === 'all' || type === 'recipes') {
    const where: any = {
      OR: [
        { title: { contains: q, mode: 'insensitive' } },
        { description: { contains: q, mode: 'insensitive' } },
        {
          ingredients: {
            some: {
              ingredient: {
                name: { contains: q, mode: 'insensitive' },
              },
            },
          },
        },
      ],
    };

    const [totalRecipes, recipes] = await Promise.all([
      prisma.recipe.count({ where }),
      prisma.recipe.findMany({
        where,
        skip,
        take: limit,
        orderBy: { averageRating: 'desc' },
        include: {
          author: {
            select: {
              id: true,
              nickname: true,
              fullName: true,
              avatarUrl: true,
            },
          },
          category: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          dietaryTags: {
            include: {
              dietaryRegime: true,
            },
          },
        },
      }),
    ]);

    let favoriteRecipeIdSet = new Set<string>();
    if (req.user && recipes.length > 0) {
      const favorites = await prisma.favoriteRecipe.findMany({
        where: {
          userId: req.user.id,
          recipeId: { in: recipes.map((r) => r.id) },
        },
        select: { recipeId: true },
      });
      favoriteRecipeIdSet = new Set(favorites.map((f) => f.recipeId));
    }

    recipesResult = {
      items: recipes.map((r) => ({
        id: r.id,
        title: r.title,
        description: r.description,
        thumbnailUrl: r.thumbnailUrl,
        servings: r.servings,
        cookingTime: r.cookingTime,
        averageRating: Number(r.averageRating),
        ratingCount: r.ratingCount,
        category: r.category,
        dietaryRegimes: r.dietaryTags.map((dt) => ({
          id: dt.dietaryRegime.id,
          name: dt.dietaryRegime.name,
          slug: dt.dietaryRegime.slug,
        })),
        author: r.author,
        isLikedByCurrentUser: favoriteRecipeIdSet.has(r.id),
      })),
      total: totalRecipes,
      page,
      totalPages: Math.ceil(totalRecipes / limit),
    };
  }

  // tìm kiếm người dùng / đầu bếp (users)
  if (type === 'all' || type === 'users') {
    const where: any = {
      OR: [
        { nickname: { contains: q, mode: 'insensitive' } },
        { fullName: { contains: q, mode: 'insensitive' } },
      ],
    };

    const [totalUsers, users] = await Promise.all([
      prisma.user.count({ where }),
      prisma.user.findMany({
        where,
        skip,
        take: limit,
        select: {
          id: true,
          nickname: true,
          fullName: true,
          avatarUrl: true,
          bio: true,
          _count: {
            select: {
              recipes: true,
              followers: true,
            },
          },
        },
      }),
    ]);

    let followingUserIdSet = new Set<string>();
    if (req.user && users.length > 0) {
      const follows = await prisma.follow.findMany({
        where: {
          followerId: req.user.id,
          followingId: { in: users.map((u) => u.id) },
        },
        select: { followingId: true },
      });
      followingUserIdSet = new Set(follows.map((f) => f.followingId));
    }

    usersResult = {
      items: users.map((u) => ({
        id: u.id,
        nickname: u.nickname,
        fullName: u.fullName,
        avatarUrl: u.avatarUrl,
        bio: u.bio,
        recipesCount: u._count.recipes,
        followersCount: u._count.followers,
        isFollowing: followingUserIdSet.has(u.id),
      })),
      total: totalUsers,
      page,
      totalPages: Math.ceil(totalUsers / limit),
    };
  }

  return res.status(200).json({
    success: true,
    message: 'Tìm kiếm thành công',
    data: {
      keyword: q,
      recipes: recipesResult,
      users: usersResult,
    },
  });
};
