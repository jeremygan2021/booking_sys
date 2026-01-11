import express from 'express';
import { createTimeSlot, updateTimeSlot, deleteTimeSlot } from '../controllers/adminController.js';
import { authenticate as authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// All admin routes require authentication and admin role
router.post('/time-slots', authenticateToken, requireAdmin, createTimeSlot);
router.put('/time-slots/:id', authenticateToken, requireAdmin, updateTimeSlot);
router.delete('/time-slots/:id', authenticateToken, requireAdmin, deleteTimeSlot);

export default router;
