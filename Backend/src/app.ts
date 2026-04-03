import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';

import authRoutes from './routes/auth.routes.js';
import monthRoutes from './routes/month.routes.js';
import entryRoutes from './routes/entry.routes.js';
import aiRoutes from './routes/ai.routes.js';
import { errorHandler } from './middleware/error.middleware.js';
import { env } from './config/env.js';

const app = express();

app.use(helmet());
app.use(cors({ origin: env.CLIENT_URL, credentials: true }));
app.use(morgan('dev'));
app.use(express.json());

app.use('/api/v1/auth', authRoutes);
app.use('/api/v1/months', monthRoutes);
app.use('/api/v1/entries', entryRoutes);
app.use('/api/v1/ai', aiRoutes);

// Health check
app.get('/health', (_req, res) => res.json({ status: 'ok' }));

app.use(errorHandler);

export default app;
