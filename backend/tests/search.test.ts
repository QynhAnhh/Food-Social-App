import request from 'supertest';
import { app } from '../src/app';
import { prismaMock } from './setup';

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

describe('Global Search APIs', () => {
  it('1. GET /api/v1/search - Trả về kết quả rỗng khi từ khóa trống', async () => {
    const res = await request(app).get('/api/v1/search?q=');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recipes.items).toEqual([]);
    expect(res.body.data.users.items).toEqual([]);
  });

  it('2. GET /api/v1/search - Tìm kiếm đồng thời công thức và người dùng cho 2 tab', async () => {
    prismaMock.recipe.count.mockResolvedValueOnce(1);
    prismaMock.recipe.findMany.mockResolvedValueOnce([
      {
        id: 'r-1',
        title: 'Bò xào hành tây',
        description: 'Món ngon',
        thumbnailUrl: 'thumb.jpg',
        servings: 2,
        cookingTime: 20,
        averageRating: 4.8,
        ratingCount: 5,
        author: { id: 'u-1', nickname: 'chef_tuan', fullName: 'Tuấn', avatarUrl: null },
        category: { id: 1, name: 'Bữa chính', slug: 'bua-chinh' },
        dietaryTags: [],
      },
    ]);
    prismaMock.favoriteRecipe.findMany.mockResolvedValueOnce([]);

    prismaMock.user.count.mockResolvedValueOnce(1);
    prismaMock.user.findMany.mockResolvedValueOnce([
      {
        id: 'u-1',
        nickname: 'chef_tuan',
        fullName: 'Nguyễn Anh Tuấn',
        avatarUrl: null,
        bio: 'Bếp trưởng',
        _count: { recipes: 5, followers: 10 },
      },
    ]);
    prismaMock.follow.findMany.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/v1/search?q=tuan').set(AUTH_HEADER);

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data.recipes.items).toHaveLength(1);
    expect(res.body.data.recipes.items[0].title).toBe('Bò xào hành tây');
    expect(res.body.data.users.items).toHaveLength(1);
    expect(res.body.data.users.items[0].nickname).toBe('chef_tuan');
  });
});
