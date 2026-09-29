import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import authRoutes from './routes/authRoutes.js';
import examRoutes from './routes/examRoutes.js';
import roomRoutes from './routes/roomRoutes.js';
import { errorHandler } from './middleware/errorHandler.js';

const app = express();

export function normalizeClientUrl(value) {
  return (value || 'http://localhost:5173').trim().replace(/\/+$/, '');
}

app.use(cors({ origin: normalizeClientUrl(process.env.CLIENT_URL), credentials: true }));
app.use(express.json());
app.use(cookieParser());

app.get('/api/health', (_request, response) => {
  response.json({ status: 'ok', service: 'exam-management-server' });
});

app.use('/api/auth', authRoutes);
app.use('/api/exams', examRoutes);
app.use('/api/rooms', roomRoutes);
app.use(errorHandler);

export default app;
