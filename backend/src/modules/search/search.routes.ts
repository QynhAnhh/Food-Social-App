import { Router } from 'express';
import { optionalAuthenticate } from '../../common/middlewares/auth.middleware';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { globalSearch } from './search.controller';

export const searchRouter = Router();

// get /api/v1/search - tìm kiếm toàn cục (2 tab công thức & người dùng)
searchRouter.get('/', optionalAuthenticate, asyncHandler(globalSearch));
