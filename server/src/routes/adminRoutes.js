import express from 'express';
import { body } from 'express-validator';
import { createTimeSlot, updateTimeSlot, deleteTimeSlot } from '../controllers/adminController.js';
import { 
  createCuisine, 
  updateCuisine, 
  deleteCuisine,
  createMealPackage,
  updateMealPackage,
  deleteMealPackage
} from '../controllers/adminRestaurantController.js';
import {
  createDiningRoom,
  updateDiningRoom,
  deleteDiningRoom,
  getDiningRoomStatistics,
  getDiningRooms
} from '../controllers/diningRoomController.js';
import { authenticate as authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Dining Room Validation Rules
const diningRoomValidation = [
  body('name').trim().notEmpty().withMessage('名称不能为空'),
  body('room_type').isIn(['mahjong', 'private', 'public', 'tea_room', 'garden', 'other']).withMessage('无效的房间类型'),
  body('capacity').isInt({ min: 1 }).withMessage('容量必须大于0'),
];

// All admin routes require authentication and admin role

// Time slots management
router.post('/time-slots', authenticateToken, requireAdmin, createTimeSlot);
router.put('/time-slots/:id', authenticateToken, requireAdmin, updateTimeSlot);
router.delete('/time-slots/:id', authenticateToken, requireAdmin, deleteTimeSlot);

// Cuisines management
router.post('/cuisines', authenticateToken, requireAdmin, createCuisine);
router.put('/cuisines/:id', authenticateToken, requireAdmin, updateCuisine);
router.delete('/cuisines/:id', authenticateToken, requireAdmin, deleteCuisine);

// Meal packages management
router.post('/packages', authenticateToken, requireAdmin, createMealPackage);
router.put('/packages/:id', authenticateToken, requireAdmin, updateMealPackage);
router.delete('/packages/:id', authenticateToken, requireAdmin, deleteMealPackage);

// Dining rooms management
router.get('/dining-rooms', authenticateToken, requireAdmin, getDiningRooms);
router.post('/dining-rooms', authenticateToken, requireAdmin, diningRoomValidation, createDiningRoom);
router.put('/dining-rooms/:id', authenticateToken, requireAdmin, diningRoomValidation, updateDiningRoom);
router.delete('/dining-rooms/:id', authenticateToken, requireAdmin, deleteDiningRoom);
router.get('/dining-rooms/:id/statistics', authenticateToken, requireAdmin, getDiningRoomStatistics);

export default router;
