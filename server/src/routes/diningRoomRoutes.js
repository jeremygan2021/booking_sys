import express from 'express';
import {
  getDiningRooms,
  getDiningRoomById,
  checkDiningRoomAvailability
} from '../controllers/diningRoomController.js';

const router = express.Router();

// Public routes - no authentication required
router.get('/', getDiningRooms);
router.get('/availability', checkDiningRoomAvailability);
router.get('/:id', getDiningRoomById);

export default router;
