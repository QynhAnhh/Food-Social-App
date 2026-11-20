import express from 'express';
import request from 'supertest';

import { asyncHandler } from '../src/common/middlewares/async-handler';
import { errorHandler } from '../src/common/middlewares/error.middleware';

describe('asyncHandler middleware', () => {
  it('should forward async errors to the global errorHandler', async () => {
    const app = express();

    app.get(
      '/test-async-error',
      asyncHandler(async (_req, _res) => {
        throw new Error('Test async error');
      }),
    );

    app.use(errorHandler);

    const consoleSpy = jest
      .spyOn(console, 'error')
      .mockImplementation(() => {});

    const response = await request(app).get('/test-async-error');

    expect(response.status).toBe(500);

    expect(response.body).toMatchObject({
      success: false,
      message: 'Đã có lỗi xảy ra trên hệ thống.',
    });

    expect(response.body.timestamp).toBeDefined();

    expect(consoleSpy).toHaveBeenCalled();

    consoleSpy.mockRestore();
  });
});