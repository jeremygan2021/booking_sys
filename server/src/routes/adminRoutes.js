import express from 'express';
import { createTimeSlot, updateTimeSlot, deleteTimeSlot } from '../controllers/adminController.js';
import { 
  createCuisine, 
  updateCuisine, 
  deleteCuisine,
  createMealPackage,
  updateMealPackage,
  deleteMealPackage
} from '../controllers/adminRestaurantController.js';
import { authenticate as authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

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

export default router;
