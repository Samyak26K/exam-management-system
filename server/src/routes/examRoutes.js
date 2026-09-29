import { Router } from 'express';
import { createExam, deleteExam, listExams, updateExam } from '../controllers/examController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);
router.get('/', listExams);
router.post('/', requireRole('admin'), createExam);
router.put('/:id', requireRole('admin'), updateExam);
router.delete('/:id', requireRole('admin'), deleteExam);
export default router;
