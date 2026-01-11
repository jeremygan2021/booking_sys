import express from 'express';
import { body } from 'express-validator';
import {
  getRoomTypes,
  getRoomTypeById,
  createRoomType,
  updateRoomType,
  deleteRoomType,
  getRooms,
  getRoomById,
  checkRoomAvailability,
  createRoomBooking,
  getUserRoomBookings,
  getRoomBookingById,
  updateRoomBookingStatus,
  getAllRoomBookings,
} from '../controllers/roomController.js';
import { authenticate, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

/**
 * 房间类型验证规则
 * Room type validation rules
 */
const roomTypeValidation = [
  body('name').notEmpty().withMessage('房间类型名称不能为空'),
  body('base_price').isFloat({ min: 0 }).withMessage('价格必须大于等于0'),
  body('max_occupancy').isInt({ min: 1 }).withMessage('最大容纳人数必须大于0'),
];

/**
 * 预订验证规则
 * Booking validation rules
 */
const bookingValidation = [
  body('room_id').isUUID().withMessage('无效的房间ID'),
  body('check_in_date').isDate().withMessage('请输入有效的入住日期'),
  body('check_out_date').isDate().withMessage('请输入有效的退房日期'),
  body('guest_count').isInt({ min: 1 }).withMessage('客人数量必须大于0'),
];

// ========== 房间类型路由 ==========
// Room type routes

// 获取所有房间类型 (公开)
router.get('/types', getRoomTypes);

// 获取单个房间类型 (公开)
router.get('/types/:id', getRoomTypeById);

// 创建房间类型 (管理员)
router.post('/types', authenticate, requireAdmin, roomTypeValidation, createRoomType);

// 更新房间类型 (管理员)
router.put('/types/:id', authenticate, requireAdmin, updateRoomType);

// 删除房间类型 (管理员)
router.delete('/types/:id', authenticate, requireAdmin, deleteRoomType);

// ========== 预订路由 ==========
// Booking routes

// 创建房间预订 (需要认证)
router.post('/bookings', authenticate, bookingValidation, createRoomBooking);

// 获取用户的预订 (需要认证)
router.get('/bookings/my', authenticate, getUserRoomBookings);

// 获取所有预订 (管理员)
router.get('/bookings/all', authenticate, requireAdmin, getAllRoomBookings);

// 获取单个预订详情 (需要认证)
router.get('/bookings/:id', authenticate, getRoomBookingById);

// 更新预订状态 (需要认证)
router.put('/bookings/:id/status', authenticate, updateRoomBookingStatus);

// ========== 房间路由 ==========
// Room routes

// 获取所有房间 (公开)
router.get('/', getRooms);

// 检查房间可用性 (公开)
router.get('/availability/check', checkRoomAvailability);

// 获取单个房间 (公开)
// 注意：这个路由必须放在最后，否则会拦截其他以 / 开头的路由
router.get('/:id', getRoomById);

export default router;
