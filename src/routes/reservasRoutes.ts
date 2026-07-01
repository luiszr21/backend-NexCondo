import { Router } from 'express';
import { reservasController } from '../controllers/reservasController.js';
import { authenticate, authorize } from '../middlewares/authMiddleware.js';
import { validate } from '../middlewares/validationMiddleware.js';
import { availableSlotsQuerySchema, createReservaSchema, reservaIdParamsSchema } from '../validations/reservasSchemas.js';

const router = Router();

router.post('/', authenticate, authorize('MORADOR'), validate(createReservaSchema, 'body'), reservasController.create);
router.patch('/:id/cancelar', authenticate, authorize('MORADOR'), validate(reservaIdParamsSchema, 'params'), reservasController.cancel);
router.get('/disponiveis', authenticate, authorize('MORADOR'), validate(availableSlotsQuerySchema, 'query'), reservasController.availableSlots);
router.get('/futuras', authenticate, authorize('MORADOR'), reservasController.futureReservations);

export default router;
