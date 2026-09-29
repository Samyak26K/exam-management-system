import { Router } from 'express';
import { createRoom, deleteRoom, listRooms, updateRoom } from '../controllers/roomController.js';
import { requireAuth, requireRole } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth, requireRole('admin'));
router.get('/', listRooms);
router.post('/', createRoom);
router.put('/:id', updateRoom);
router.delete('/:id', deleteRoom);
export default router;