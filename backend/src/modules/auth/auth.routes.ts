
import { Router } from 'express';
import { googleLogin } from './auth.controller';

export const authRouter = Router();

// Google Login API
authRouter.post('/google', googleLogin);
