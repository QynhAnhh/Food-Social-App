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
});
