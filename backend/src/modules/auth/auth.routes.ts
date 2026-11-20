
import { Router } from 'express';
import { asyncHandler } from '../../common/middlewares/async-handler';
import { googleLogin } from './auth.controller';

export const authRouter = Router();

// Google Login API
authRouter.post('/google', asyncHandler(googleLogin));
