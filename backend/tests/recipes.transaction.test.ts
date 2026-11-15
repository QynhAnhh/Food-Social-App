import request from 'supertest';
import { app } from '../src/app';
import { prismaMock } from './setup';
import {
  createRecipeTransaction,
  updateRecipeTransaction,
  RecipeTransactionError,
} from '../src/modules/recipes/recipe.transaction';

const AUTH_HEADER = { Authorization: 'Bearer valid-token' };

describe('Recipe Multi-table Transaction (Task FSA-15)', () => {
  const sampleCreateInput = {
    authorId: 'user-uuid-1',
    categoryId: 1,
    title: 'Bò Xào Húng Quế',
    description: 'Món xào thơm ngon',
    thumbnailUrl: 'https://example.com/bo_xao.png',
    cookingTime: 20,
    servings: 2,
    steps: [
      { stepNumber: 1, instruction: 'Thái thịt bò mỏng', imageUrl: null, timerSeconds: 300 },
      { stepNumber: 2, instruction: 'Xào nhanh tay với húng quế', imageUrl: null, timerSeconds: 600 },
    ],
    ingredients: [
      { ingredientId: 1, quantity: 300, note: 'Thái mỏng' },
      { ingredientId: 2, quantity: 50, note: 'Rửa sạch' },
    ],
    dietaryTagIds: [1],
  };

  describe('createRecipeTransaction', () => {
    it('1. Tạo thành công đồng thời cả 4 bảng trong 1 Transaction', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'user-uuid-1' });
      prismaMock.category.findUnique.mockResolvedValueOnce({ id: 1, name: 'Bữa chính' });
      prismaMock.ingredient.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      prismaMock.dietaryRegime.findMany.mockResolvedValueOnce([{ id: 1 }]);

      prismaMock.recipe.create.mockResolvedValueOnce({ id: 'rec-uuid-1' });
      prismaMock.recipeStep.createMany.mockResolvedValueOnce({ count: 2 });
      prismaMock.recipeIngredient.createMany.mockResolvedValueOnce({ count: 2 });
      prismaMock.recipeDietaryTag.createMany.mockResolvedValueOnce({ count: 1 });

      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: 'rec-uuid-1',
        title: 'Bò Xào Húng Quế',
        author: { id: 'user-uuid-1', nickname: 'chef_nhat' },
        category: { id: 1, name: 'Bữa chính' },
        steps: sampleCreateInput.steps,
        ingredients: sampleCreateInput.ingredients,
        dietaryTags: [{ dietaryRegime: { id: 1, name: 'Eat Clean' } }],
      });

      const result = await createRecipeTransaction(sampleCreateInput, prismaMock as any);

      expect(prismaMock.$transaction).toHaveBeenCalledTimes(1);
      expect(prismaMock.recipe.create).toHaveBeenCalledTimes(1);
      expect(prismaMock.recipeStep.createMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.recipeIngredient.createMany).toHaveBeenCalledTimes(1);
      expect(prismaMock.recipeDietaryTag.createMany).toHaveBeenCalledTimes(1);
      expect(result.id).toBe('rec-uuid-1');
      expect(result.title).toBe('Bò Xào Húng Quế');
    });

    it('2. Ném lỗi RECIPE_MISSING_STEPS nếu không có bước thực hiện', async () => {
      await expect(
        createRecipeTransaction({ ...sampleCreateInput, steps: [] }, prismaMock as any),
      ).rejects.toThrow(RecipeTransactionError);

      try {
        await createRecipeTransaction({ ...sampleCreateInput, steps: [] }, prismaMock as any);
      } catch (err: any) {
        expect(err.errorCode).toBe('RECIPE_MISSING_STEPS');
        expect(err.statusCode).toBe(400);
      }
    });

    it('3. Ném lỗi DUPLICATE_INGREDIENT nếu danh sách nguyên liệu bị trùng lặp ID', async () => {
      const duplicateIngredients = [
        { ingredientId: 1, quantity: 100 },
        { ingredientId: 1, quantity: 200 },
      ];

      await expect(
        createRecipeTransaction(
          { ...sampleCreateInput, ingredients: duplicateIngredients },
          prismaMock as any,
        ),
      ).rejects.toThrow('Danh sách nguyên liệu bị trùng lặp nguyên liệu.');
    });

    it('4. Rollback và ném lỗi INGREDIENT_NOT_FOUND nếu nguyên liệu không có trong từ điển', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'user-uuid-1' });
      prismaMock.category.findUnique.mockResolvedValueOnce({ id: 1 });
      // Giả lập chỉ tìm thấy 1 trên 2 nguyên liệu
      prismaMock.ingredient.findMany.mockResolvedValueOnce([{ id: 1 }]);

      await expect(
        createRecipeTransaction(sampleCreateInput, prismaMock as any),
      ).rejects.toThrow('Một hoặc nhiều nguyên liệu không tồn tại trong từ điển chuẩn.');
    });
  });

  describe('updateRecipeTransaction', () => {
    it('5. Cập nhật thành công và đồng bộ lại steps, ingredients, tags', async () => {
      const updateData = {
        authorId: 'user-uuid-1',
        title: 'Bò Xào Húng Quế Cay Nồng',
        steps: [{ stepNumber: 1, instruction: 'Bước 1 cập nhật' }],
        ingredients: [{ ingredientId: 1, quantity: 500 }],
        dietaryTagIds: [1],
      };

      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: 'rec-uuid-1',
        authorId: 'user-uuid-1',
      });
      prismaMock.ingredient.findMany.mockResolvedValueOnce([{ id: 1 }]);
      prismaMock.dietaryRegime.findMany.mockResolvedValueOnce([{ id: 1 }]);

      prismaMock.recipe.update.mockResolvedValueOnce({ id: 'rec-uuid-1' });
      prismaMock.recipeStep.deleteMany.mockResolvedValueOnce({ count: 2 });
      prismaMock.recipeStep.createMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.recipeIngredient.deleteMany.mockResolvedValueOnce({ count: 2 });
      prismaMock.recipeIngredient.createMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.recipeDietaryTag.deleteMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.recipeDietaryTag.createMany.mockResolvedValueOnce({ count: 1 });

      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: 'rec-uuid-1',
        title: updateData.title,
      });

      const updated = await updateRecipeTransaction('rec-uuid-1', updateData, prismaMock as any);

      expect(prismaMock.recipeStep.deleteMany).toHaveBeenCalledWith({ where: { recipeId: 'rec-uuid-1' } });
      expect(prismaMock.recipeIngredient.deleteMany).toHaveBeenCalledWith({ where: { recipeId: 'rec-uuid-1' } });
      expect(prismaMock.recipeDietaryTag.deleteMany).toHaveBeenCalledWith({ where: { recipeId: 'rec-uuid-1' } });
      expect(updated.title).toBe('Bò Xào Húng Quế Cay Nồng');
    });

    it('6. Chặn người dùng khác sửa công thức (403 NOT_RECIPE_OWNER)', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: 'rec-uuid-1',
        authorId: 'another-user-uuid',
      });

      await expect(
        updateRecipeTransaction('rec-uuid-1', { authorId: 'user-uuid-1', title: 'Hack recipe' }, prismaMock as any),
      ).rejects.toThrow('Bạn không có quyền chỉnh sửa công thức của người khác.');
    });

    it('7. Ném lỗi 404 RECIPE_NOT_FOUND nếu công thức không tồn tại', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce(null);

      await expect(
        updateRecipeTransaction('non-existent-id', { title: 'Món ăn mới' }, prismaMock as any),
      ).rejects.toThrow('Công thức không tồn tại hoặc đã bị xóa.');
    });
  });

  describe('Recipe Endpoints Integration', () => {
    it('8. POST /api/v1/recipes - Gọi tạo công thức thành công trả về 201', async () => {
      prismaMock.user.findUnique.mockResolvedValueOnce({ id: 'user-uuid-1' });
      prismaMock.category.findUnique.mockResolvedValueOnce({ id: 1 });
      prismaMock.ingredient.findMany.mockResolvedValueOnce([{ id: 1 }, { id: 2 }]);
      prismaMock.dietaryRegime.findMany.mockResolvedValueOnce([{ id: 1 }]);
      prismaMock.recipe.create.mockResolvedValueOnce({ id: 'rec-uuid-1' });
      prismaMock.recipeStep.createMany.mockResolvedValueOnce({ count: 2 });
      prismaMock.recipeIngredient.createMany.mockResolvedValueOnce({ count: 2 });
      prismaMock.recipeDietaryTag.createMany.mockResolvedValueOnce({ count: 1 });
      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: 'rec-uuid-1',
        title: 'Bò Xào Húng Quế',
        steps: sampleCreateInput.steps,
      });

      const res = await request(app)
        .post('/api/v1/recipes')
        .set(AUTH_HEADER)
        .send(sampleCreateInput);

      expect(res.status).toBe(201);
      expect(res.body.success).toBe(true);
      expect(res.body.data.id).toBe('rec-uuid-1');
    });

    it('9. PUT /api/v1/recipes/:id - Cập nhật công thức thành công trả về 200', async () => {
      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: 'rec-uuid-1',
        authorId: 'user-uuid-1',
      });
      prismaMock.recipe.update.mockResolvedValueOnce({ id: 'rec-uuid-1' });
      prismaMock.recipe.findUnique.mockResolvedValueOnce({
        id: 'rec-uuid-1',
        title: 'Món mới cập nhật',
      });

      const res = await request(app)
        .put('/api/v1/recipes/rec-uuid-1')
        .set(AUTH_HEADER)
        .send({ title: 'Món mới cập nhật' });

      expect(res.status).toBe(200);
      expect(res.body.success).toBe(true);
      expect(res.body.data.title).toBe('Món mới cập nhật');
    });
  });
});

