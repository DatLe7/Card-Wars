import express, {
  Express,
  Router,
  Response as ExResponse,
  Request as ExRequest,
  ErrorRequestHandler
} from 'express';
import cors from 'cors';
import swaggerUi from 'swagger-ui-express';
import cookieParser from 'cookie-parser';

import { RegisterRoutes } from '../build/routes';
import { pool } from './db';

const app: Express = express();
app.use(cors({ origin: process.env.APP_ORIGIN || 'http://localhost:3000', credentials: true, }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.get('/api/health', async (_req, res) => {
  try {
    await pool.query('SELECT 1');
    res.json({ status: 'ok' });
  } catch {
    res.status(503).json({ status: 'unavailable' });
  }
});

app.use(
  '/api/v0/docs',
  swaggerUi.serve,
  async (_req: ExRequest, res: ExResponse) => {
    res.send(swaggerUi.generateHTML(await import('../build/swagger.json')));
  },
);

const router = Router();
RegisterRoutes(router);
app.use('/api/v0', router);

const errorHandler: ErrorRequestHandler = (
  err,
  _req,
  res,
  next,
) => {
  if (res.headersSent) {
    next(err);
    return;
  }

  res.status(err.status || 500).json({
    message: err.message,
    errors: err.errors,
    status: err.status || 500,
  });
};

app.use(errorHandler);
app.set('trust proxy', 1);

export default app;
