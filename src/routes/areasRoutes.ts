import { Router } from 'express';
import { areasController } from '../controllers/areasController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { areaIdParamsSchema, createAreaSchema, updateAreaSchema } from '../validations/areasSchemas.js';

const router = Router();

// Todas as rotas desse módulo são restritas a ADMIN
router.post('/', authenticate, authorize('ADMINISTRADOR'), validate(createAreaSchema, 'body'), areasController.create);
router.patch('/:id', authenticate, authorize('ADMINISTRADOR'), validate(areaIdParamsSchema, 'params'), validate(updateAreaSchema, 'body'), areasController.update);
router.get('/', authenticate, authorize('ADMINISTRADOR'), areasController.list);
router.delete('/:id', authenticate, authorize('ADMINISTRADOR'), validate(areaIdParamsSchema, 'params'), areasController.delete);

export default router;
