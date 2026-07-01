import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { forgotPasswordAuthSchema, loginAuthSchema, registerAuthSchema, resetPasswordAuthSchema } from '../validations/authSchemas.js';

const router = Router();

router.post('/register', validate(registerAuthSchema, 'body'), authController.register);
router.post('/login', validate(loginAuthSchema, 'body'), authController.login);
router.post('/forgot-password', validate(forgotPasswordAuthSchema, 'body'), authController.forgotPassword);
router.post('/reset-password', validate(resetPasswordAuthSchema, 'body'), authController.resetPassword);

router.get('/me', authenticate, authorize('ADMINISTRADOR', 'FUNCIONARIO', 'MORADOR'), authController.me);

export default router;
