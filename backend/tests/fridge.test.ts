import request from 'supertest';
import { app } from '../src/app';
import { prismaMock } from './setup';

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

describe('Smart Fridge & Recommendations APIs', () => {
  it('1. POST /fridge/items - Thêm nguyên liệu vào tủ lạnh', async () => {
    prismaMock.userFridgeItem.upsert.mockResolvedValueOnce({
      id: 'fridge-item-1',
      ingredientId: 1,
      quantity: 500,
      expiryDate: null,
      ingredient: { id: 1, name: 'Thịt bò thăn', standardUnit: 'gram' },
    });

    const res = await request(app).post('/api/v1/fridge/items').set(AUTH_HEADER).send({ ingredientId: 1, quantity: 500 });
    expect(res.status).toBe(201);
    expect(res.body.data.quantity).toBe(500);
  });

  it('2. GET /fridge/recommendations - Xếp hạng đúng tỷ lệ khớp nguyên liệu', async () => {
    prismaMock.userFridgeItem.findMany.mockResolvedValueOnce([{ ingredientId: 1, quantity: 500 }]);
    prismaMock.userAllergy.findMany.mockResolvedValueOnce([]);
    prismaMock.recipe.findMany.mockResolvedValueOnce([
      {
        id: 'rec-full',
        title: 'Bò áp chảo',
        thumbnailUrl: 'url',
        cookingTime: 15,
        servings: 2,
        averageRating: 4.8,
        category: { id: 1, name: 'Bữa chính', slug: 'bua-chinh' },
        author: { id: 'u1', nickname: 'chef1', fullName: 'Chef 1', avatarUrl: null },
        ingredients: [{ ingredientId: 1, quantity: 400, ingredient: { name: 'Thịt bò', standardUnit: 'gram' } }],
      },
    ]);

    const res = await request(app).get('/api/v1/fridge/recommendations').set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.data[0].matchPercentage).toBe(100);
  });

  it('3. GET /fridge/recommendations - Tủ lạnh rỗng trả về mảng data rỗng', async () => {
    prismaMock.userFridgeItem.findMany.mockResolvedValueOnce([]);
    prismaMock.userAllergy.findMany.mockResolvedValueOnce([]);

    const res = await request(app).get('/api/v1/fridge/recommendations').set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(0);
    expect(res.body.message).toContain('Tủ lạnh đang trống');
  });

  it('4. GET /fridge/recommendations - Ưu tiên món có tỷ lệ khớp cao hơn và ít thiếu hơn', async () => {
    prismaMock.userFridgeItem.findMany.mockResolvedValueOnce([
      { ingredientId: 1, quantity: 300 },
      { ingredientId: 2, quantity: 200 },
    ]);
    prismaMock.userAllergy.findMany.mockResolvedValueOnce([]);
    prismaMock.recipe.findMany.mockResolvedValueOnce([
      {
        id: 'rec-half',
        title: 'Món khớp 50%',
        thumbnailUrl: 'url',
        cookingTime: 20,
        servings: 2,
        averageRating: 5.0,
        category: { id: 1, name: 'Bữa chính', slug: 'bua-chinh' },
        author: { id: 'u1', nickname: 'c1', fullName: 'C 1', avatarUrl: null },
        ingredients: [
          { ingredientId: 1, quantity: 200, ingredient: { name: 'Thịt bò', standardUnit: 'gram' } },
          { ingredientId: 99, quantity: 50, ingredient: { name: 'Gia vị hiếm', standardUnit: 'gram' } },
        ],
      },
      {
        id: 'rec-full',
        title: 'Món khớp 100%',
        thumbnailUrl: 'url',
        cookingTime: 15,
        servings: 2,
        averageRating: 4.5,
        category: { id: 1, name: 'Bữa chính', slug: 'bua-chinh' },
        author: { id: 'u2', nickname: 'c2', fullName: 'C 2', avatarUrl: null },
        ingredients: [
          { ingredientId: 1, quantity: 300, ingredient: { name: 'Thịt bò', standardUnit: 'gram' } },
        ],
      },
    ]);

    const res = await request(app).get('/api/v1/fridge/recommendations').set(AUTH_HEADER);
    expect(res.status).toBe(200);
    expect(res.body.data[0].id).toBe('rec-full'); // Khớp 100% phải xếp đầu
    expect(res.body.data[1].id).toBe('rec-half'); // Khớp 50% xếp sau
  });
});
