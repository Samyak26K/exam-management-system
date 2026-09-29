import { Router } from 'express';
import { currentUser, login, logout, registerAdmin, registerStudent } from '../controllers/authController.js';
import { requireAuth } from '../middleware/auth.js';

const router = Router();
router.post('/student/register', registerStudent);
router.post('/admin/register', registerAdmin);
router.post('/login', login);
router.post('/logout', logout);
router.get('/me', requireAuth, currentUser);
export default router;
