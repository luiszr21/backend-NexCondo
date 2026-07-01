import { Router } from 'express';
import { usersController } from '../controllers/usersController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { userIdParamsSchema, updateUserProfileSchema } from '../validations/usersSchemas.js';

const router = Router();

// Consultar próprio perfil
router.get('/me', authenticate, usersController.getProfile);

// Atualizar próprio perfil
router.patch('/me', authenticate, validate(updateUserProfileSchema, 'body'), usersController.updateProfile);

// Listar usuários (apenas ADMIN)
router.get('/', authenticate, authorize('ADMINISTRADOR'), usersController.listUsers);

// Excluir usuário (ADMIN pode excluir qualquer usuário salvo regras; usuário pode excluir a si mesmo)
router.delete('/:id', authenticate, validate(userIdParamsSchema, 'params'), usersController.deleteUser);

export default router;
