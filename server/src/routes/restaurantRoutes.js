import express from 'express';
import {
  getCuisines,
  getCuisineById,
  getMealPackages,
  getMealPackageById,
  getTimeSlots,
  checkAvailability,
  createRestaurantBooking,
  getRestaurantBookings,
  getRestaurantBookingById,
  updateRestaurantBooking,
  deleteRestaurantBooking,
  getRestaurantContent
} from '../controllers/restaurantController.js';
import { authenticate as authenticateToken } from '../middleware/auth.js';

const router = express.Router();

// 公开路由 - 不需要认证
router.get('/cuisines', getCuisines);
router.get('/cuisines/:id', getCuisineById);
router.get('/packages', getMealPackages);
router.get('/packages/:id', getMealPackageById);
router.get('/time-slots', getTimeSlots);
router.get('/availability', checkAvailability);
router.get('/content', getRestaurantContent);

// 需要认证的路由
router.post('/bookings', authenticateToken, createRestaurantBooking);
router.get('/bookings', authenticateToken, getRestaurantBookings);
router.get('/bookings/:id', authenticateToken, getRestaurantBookingById);
router.put('/bookings/:id', authenticateToken, updateRestaurantBooking);
router.delete('/bookings/:id', authenticateToken, deleteRestaurantBooking);

export default router;
