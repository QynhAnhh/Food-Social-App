import request from 'supertest';
import { app } from '../src/app';
import { prismaMock } from './setup';

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

describe('GET /api/v1/recipes/:id', () => {
  it('1. Trả về đầy đủ thông tin công thức, nguyên liệu, bước nấu và tác giả', async () => {
    prismaMock.recipe.findUnique.mockResolvedValueOnce({
      id: 'rec-101',
      title: 'Thịt bò xào bông cải xanh',
      description: 'Món xào nhanh gọn',
      thumbnailUrl: 'url',
      servings: 2,
      cookingTime: 20,
      averageRating: 4.8,
      createdAt: new Date(),
      updatedAt: new Date(),
      author: { id: 'usr-01', nickname: 'bep_cua_anh', fullName: 'Quốc Anh', avatarUrl: null, bio: null },
      category: { id: 1, name: 'Bữa chính', slug: 'bua-chinh', iconUrl: null },
      dietaryTags: [],
      ingredients: [{ id: 'ri-1', quantity: 300, note: null, ingredient: { id: 1, name: 'Thịt bò', standardUnit: 'gram', imageUrl: null } }],
      steps: [{ id: 'stp-1', stepNumber: 1, instruction: 'Ướp thịt bò', imageUrl: null, timerSeconds: 600 }],
      _count: { reviews: 5, cooksnaps: 2, favoritedBy: 10 },
    });
    prismaMock.favoriteRecipe.findUnique.mockResolvedValueOnce(null);

    const res = await request(app).get('/api/v1/recipes/rec-101').set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.data.author.nickname).toBe('bep_cua_anh');
    expect(res.body.data.ingredients).toHaveLength(1);
    expect(res.body.data.steps).toHaveLength(1);
  });
});
