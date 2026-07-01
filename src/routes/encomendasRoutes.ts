import { Router } from 'express';
import { encomendasController } from '../controllers/encomendasController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { createEncomendaSchema, encomendaIdParamsSchema, updateEncomendaStatusSchema } from '../validations/encomendasSchemas.js';

const router = Router();

router.post('/', authenticate, authorize('ADMINISTRADOR', 'FUNCIONARIO'), validate(createEncomendaSchema, 'body'), encomendasController.create);
router.get('/', authenticate, authorize('ADMINISTRADOR', 'FUNCIONARIO', 'MORADOR'), encomendasController.list);
router.get('/:id', authenticate, authorize('ADMINISTRADOR', 'FUNCIONARIO', 'MORADOR'), validate(encomendaIdParamsSchema, 'params'), encomendasController.getById);
router.patch('/:id/status', authenticate, authorize('ADMINISTRADOR', 'FUNCIONARIO'), validate(encomendaIdParamsSchema, 'params'), validate(updateEncomendaStatusSchema, 'body'), encomendasController.updateStatus);

export default router;
