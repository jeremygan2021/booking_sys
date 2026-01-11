import express from 'express';
import {
  getRestaurantContent,
  updateRestaurantContent,
  getCuisines,
  createCuisine,
  updateCuisine,
  deleteCuisine,
  getRoomTypes,
  updateRoomType,
} from '../controllers/contentController.js';
import { authenticate as authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// Restaurant content routes
router.get('/restaurant', getRestaurantContent);
router.put('/restaurant', authenticateToken, requireAdmin, updateRestaurantContent);

// Cuisines routes
router.get('/cuisines', getCuisines);
router.post('/cuisines', authenticateToken, requireAdmin, createCuisine);
router.put('/cuisines/:id', authenticateToken, requireAdmin, updateCuisine);
router.delete('/cuisines/:id', authenticateToken, requireAdmin, deleteCuisine);

// Room types routes
router.get('/room-types', getRoomTypes);
router.put('/room-types/:id', authenticateToken, requireAdmin, updateRoomType);

export default router;
