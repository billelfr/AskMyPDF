import cors from 'cors';
import express from 'express';
import helmet from 'helmet';
import morgan from 'morgan';

import { env } from './config/env.js';
import { errorHandler, notFoundHandler } from './middleware/error.middleware.js';
import documentRoutes from './routes/document.routes.js';
import healthRoutes from './routes/health.routes.js';

const app = express();

app.use(helmet());
app.use(
  cors({
    origin: env.corsOrigin,
  }),
);
app.use(morgan(env.nodeEnv === 'production' ? 'combined' : 'dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(healthRoutes);
app.use(documentRoutes);

app.use(notFoundHandler);
app.use(errorHandler);

export default app;
