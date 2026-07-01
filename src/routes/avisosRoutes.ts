import { Router } from 'express';
import { avisosController } from '../controllers/avisosController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { avisoIdParamsSchema, createAvisoSchema, updateAvisoSchema } from '../validations/avisosSchemas.js';

const router = Router();

router.get('/', authenticate, authorize('ADMINISTRADOR', 'MORADOR'), avisosController.list);
router.get('/:id', authenticate, authorize('ADMINISTRADOR', 'MORADOR'), validate(avisoIdParamsSchema, 'params'), avisosController.getById);
router.post('/', authenticate, authorize('ADMINISTRADOR'), validate(createAvisoSchema, 'body'), avisosController.create);
router.patch('/:id', authenticate, authorize('ADMINISTRADOR'), validate(avisoIdParamsSchema, 'params'), validate(updateAvisoSchema, 'body'), avisosController.update);
router.delete('/:id', authenticate, authorize('ADMINISTRADOR'), validate(avisoIdParamsSchema, 'params'), avisosController.delete);

export default router;
