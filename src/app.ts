import express from 'express';
import type { Request, Response } from 'express';
import authRoutes from './routes/authRoutes.js';
import usersRoutes from './routes/usersRoutes.js';
import areasRoutes from './routes/areasRoutes.js';
import reservasRoutes from './routes/reservasRoutes.js';
import avisosRoutes from './routes/avisosRoutes.js';
import encomendasRoutes from './routes/encomendasRoutes.js';
import { errorHandler, notFoundHandler } from './middlewares/errorMiddleware.js';

const app = express();

app.use(express.json());
app.use('/auth', authRoutes);
app.use('/users', usersRoutes);
app.use('/areas', areasRoutes);
app.use('/reservas', reservasRoutes);
app.use('/avisos', avisosRoutes);
app.use('/encomendas', encomendasRoutes);

app.get('/health', (_req: Request, res: Response) => {
  res.status(200).json({ status: 'ok' });
});

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
