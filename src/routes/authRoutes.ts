import { Router } from 'express';
import { authController } from '../controllers/authController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';

const router = Router();

router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/forgot-password', authController.forgotPassword);
router.post('/reset-password', authController.resetPassword);

router.get('/me', authenticate, authorize('ADMINISTRADOR', 'FUNCIONARIO', 'MORADOR'), (req, res) => {
  const user = (req as any).user;
  res.status(200).json({ user });
});

export default router;
