import request from 'supertest';
import { app } from '../src/app';
import { prismaMock } from './setup';

describe('Master Data APIs', () => {
  it('1. GET /api/v1/categories - Trả về danh sách danh mục món ăn chuẩn', async () => {
    prismaMock.category.findMany.mockResolvedValueOnce([
      { id: 1, name: 'Bữa chính', slug: 'bua-chinh', iconUrl: 'icon-1.png' },
      { id: 2, name: 'Món tráng miệng', slug: 'mon-trang-mieng', iconUrl: 'icon-2.png' },
    ]);

    const res = await request(app).get('/api/v1/categories');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].slug).toBe('bua-chinh');
  });

  it('2. GET /api/v1/dietary-regimes - Trả về danh sách chế độ ăn kiêng', async () => {
    prismaMock.dietaryRegime.findMany.mockResolvedValueOnce([
      { id: 1, name: 'Eat Clean', slug: 'eat-clean', description: 'Ăn sạch' },
      { id: 2, name: 'Keto', slug: 'keto', description: 'Ketogenic' },
    ]);

    const res = await request(app).get('/api/v1/dietary-regimes');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].slug).toBe('eat-clean');
  });

  it('3. GET /api/v1/ingredients - Tìm kiếm từ điển nguyên liệu chuẩn', async () => {
    prismaMock.ingredient.findMany.mockResolvedValueOnce([
      { id: 1, name: 'Thịt bò thăn', standardUnit: 'gram', imageUrl: null, isAllergenCommon: false },
      { id: 2, name: 'Tôm sú', standardUnit: 'gram', imageUrl: null, isAllergenCommon: true },
    ]);

    const res = await request(app).get('/api/v1/ingredients?q=thịt&isAllergenCommon=false');

    expect(res.status).toBe(200);
    expect(res.body.success).toBe(true);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data[0].name).toBe('Thịt bò thăn');
  });
});
