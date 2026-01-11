import pool from '../db/connection.js';
import { validationResult } from 'express-validator';
import websocketService from '../services/websocketService.js';

/**
 * 获取所有房间类型
 * Get all room types
 */
export const getRoomTypes = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT id, name, description, base_price, max_occupancy, amenities, images, 
              created_at, updated_at 
       FROM room_types 
       ORDER BY base_price ASC`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个房间类型详情
 * Get single room type details
 */
export const getRoomTypeById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, description, base_price, max_occupancy, amenities, images, 
              created_at, updated_at 
       FROM room_types 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROOM_TYPE_NOT_FOUND',
          message: '房间类型不存在',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建房间类型 (管理员)
 * Create room type (admin)
 */
export const createRoomType = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '输入验证失败',
          details: errors.array(),
        },
      });
    }

    const { name, description, base_price, max_occupancy, amenities, images } = req.body;

    const result = await pool.query(
      `INSERT INTO room_types (name, description, base_price, max_occupancy, amenities, images)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [name, description, base_price, max_occupancy, amenities || [], images || []]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新房间类型 (管理员)
 * Update room type (admin)
 */
export const updateRoomType = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '输入验证失败',
          details: errors.array(),
        },
      });
    }

    const { id } = req.params;
    const { name, description, base_price, max_occupancy, amenities, images } = req.body;

    const result = await pool.query(
      `UPDATE room_types 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           base_price = COALESCE($3, base_price),
           max_occupancy = COALESCE($4, max_occupancy),
           amenities = COALESCE($5, amenities),
           images = COALESCE($6, images)
       WHERE id = $7
       RETURNING *`,
      [name, description, base_price, max_occupancy, amenities, images, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROOM_TYPE_NOT_FOUND',
          message: '房间类型不存在',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除房间类型 (管理员)
 * Delete room type (admin)
 */
export const deleteRoomType = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      'DELETE FROM room_types WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROOM_TYPE_NOT_FOUND',
          message: '房间类型不存在',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: '房间类型已删除',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有房间
 * Get all rooms
 */
export const getRooms = async (req, res, next) => {
  try {
    const result = await pool.query(
      `SELECT r.id, r.room_number, r.status, r.created_at, r.updated_at,
              rt.id as room_type_id, rt.name as room_type_name, 
              rt.description, rt.base_price, rt.max_occupancy, 
              rt.amenities, rt.images
       FROM rooms r
       LEFT JOIN room_types rt ON r.room_type_id = rt.id
       ORDER BY r.room_number ASC`
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个房间详情
 * Get single room details
 */
export const getRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT r.id, r.room_number, r.status, r.created_at, r.updated_at,
              rt.id as room_type_id, rt.name as room_type_name, 
              rt.description, rt.base_price, rt.max_occupancy, 
              rt.amenities, rt.images
       FROM rooms r
       LEFT JOIN room_types rt ON r.room_type_id = rt.id
       WHERE r.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'ROOM_NOT_FOUND',
          message: '房间不存在',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 检查房间可用性
 * Check room availability
 */
export const checkRoomAvailability = async (req, res, next) => {
  try {
    const { check_in_date, check_out_date, room_type_id } = req.query;

    if (!check_in_date || !check_out_date) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_DATES',
          message: '请提供入住和退房日期',
        },
      });
    }

    // 查询可用房间
    let query = `
      SELECT r.id, r.room_number, rt.name as room_type_name, 
             rt.base_price, rt.max_occupancy, rt.amenities, rt.images
      FROM rooms r
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      WHERE r.status = 'available'
        AND r.id NOT IN (
          SELECT room_id 
          FROM room_bookings 
          WHERE status IN ('pending', 'confirmed')
            AND (
              (check_in_date <= $1 AND check_out_date > $1)
              OR (check_in_date < $2 AND check_out_date >= $2)
              OR (check_in_date >= $1 AND check_out_date <= $2)
            )
        )
    `;

    const params = [check_in_date, check_out_date];

    if (room_type_id) {
      query += ' AND r.room_type_id = $3';
      params.push(room_type_id);
    }

    query += ' ORDER BY rt.base_price ASC';

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        available_rooms: result.rows,
        check_in_date,
        check_out_date,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建访客房间预订（无需认证）
 * Create guest room booking (no authentication required)
 */
export const createGuestRoomBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '输入验证失败',
          details: errors.array(),
        },
      });
    }

    const { room_id, check_in_date, check_out_date, guest_name, guest_phone, guest_count, special_requests } = req.body;

    // 验证必填字段
    if (!guest_name || !guest_phone) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_GUEST_INFO',
          message: '请提供姓名和手机号码',
        },
      });
    }

    // 验证手机号格式
    if (!/^[0-9]{11}$/.test(guest_phone)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_PHONE',
          message: '请输入有效的11位手机号码',
        },
      });
    }

    // 检查房间是否可用
    const availabilityCheck = await pool.query(
      `SELECT r.id, rt.base_price, rt.max_occupancy
       FROM rooms r
       LEFT JOIN room_types rt ON r.room_type_id = rt.id
       WHERE r.id = $1 AND r.status = 'available'
         AND r.id NOT IN (
           SELECT room_id 
           FROM room_bookings 
           WHERE status IN ('pending', 'confirmed')
             AND (
               (check_in_date <= $2 AND check_out_date > $2)
               OR (check_in_date < $3 AND check_out_date >= $3)
               OR (check_in_date >= $2 AND check_out_date <= $3)
             )
         )`,
      [room_id, check_in_date, check_out_date]
    );

    if (availabilityCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ROOM_NOT_AVAILABLE',
          message: '该房间在所选日期不可用',
        },
      });
    }

    const room = availabilityCheck.rows[0];

    // 检查客人数量
    if (guest_count > room.max_occupancy) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EXCEEDS_MAX_OCCUPANCY',
          message: `客人数量超过房间最大容纳人数 (${room.max_occupancy})`,
        },
      });
    }

    // 计算总价格 (天数 * 基础价格)
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const total_price = nights * parseFloat(room.base_price);

    // 创建预订（不关联用户）
    const result = await pool.query(
      `INSERT INTO room_bookings 
       (room_id, check_in_date, check_out_date, guest_name, guest_phone, guest_count, total_price, special_requests, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [room_id, check_in_date, check_out_date, guest_name, guest_phone, guest_count, total_price, special_requests]
    );

    const booking = result.rows[0];

    // Notify via WebSocket
    websocketService.notifyBookingCreated(booking, 'room');
    websocketService.notifyAvailabilityChanged(check_in_date, 'room');

    res.status(201).json({
      success: true,
      data: booking,
      message: '预订创建成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建房间预订
 * Create room booking
 */
export const createRoomBooking = async (req, res, next) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: '输入验证失败',
          details: errors.array(),
        },
      });
    }

    const { room_id, check_in_date, check_out_date, guest_count, special_requests } = req.body;
    const user_id = req.user?.id; // 从认证中间件获取

    // 检查房间是否可用
    const availabilityCheck = await pool.query(
      `SELECT r.id, rt.base_price, rt.max_occupancy
       FROM rooms r
       LEFT JOIN room_types rt ON r.room_type_id = rt.id
       WHERE r.id = $1 AND r.status = 'available'
         AND r.id NOT IN (
           SELECT room_id 
           FROM room_bookings 
           WHERE status IN ('pending', 'confirmed')
             AND (
               (check_in_date <= $2 AND check_out_date > $2)
               OR (check_in_date < $3 AND check_out_date >= $3)
               OR (check_in_date >= $2 AND check_out_date <= $3)
             )
         )`,
      [room_id, check_in_date, check_out_date]
    );

    if (availabilityCheck.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'ROOM_NOT_AVAILABLE',
          message: '该房间在所选日期不可用',
        },
      });
    }

    const room = availabilityCheck.rows[0];

    // 检查客人数量
    if (guest_count > room.max_occupancy) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'EXCEEDS_MAX_OCCUPANCY',
          message: `客人数量超过房间最大容纳人数 (${room.max_occupancy})`,
        },
      });
    }

    // 计算总价格 (天数 * 基础价格)
    const checkIn = new Date(check_in_date);
    const checkOut = new Date(check_out_date);
    const nights = Math.ceil((checkOut - checkIn) / (1000 * 60 * 60 * 24));
    const total_price = nights * parseFloat(room.base_price);

    // 创建预订
    const result = await pool.query(
      `INSERT INTO room_bookings 
       (user_id, room_id, check_in_date, check_out_date, guest_count, total_price, special_requests)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [user_id, room_id, check_in_date, check_out_date, guest_count, total_price, special_requests]
    );

    const booking = result.rows[0];

    // Notify via WebSocket
    websocketService.notifyBookingCreated(booking, 'room');
    websocketService.notifyAvailabilityChanged(check_in_date, 'room');

    res.status(201).json({
      success: true,
      data: booking,
      message: '预订创建成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用户的房间预订
 * Get user's room bookings
 */
export const getUserRoomBookings = async (req, res, next) => {
  try {
    const user_id = req.user?.id;

    const result = await pool.query(
      `SELECT rb.*, r.room_number, rt.name as room_type_name, rt.images
       FROM room_bookings rb
       LEFT JOIN rooms r ON rb.room_id = r.id
       LEFT JOIN room_types rt ON r.room_type_id = rt.id
       WHERE rb.user_id = $1
       ORDER BY rb.created_at DESC`,
      [user_id]
    );

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个预订详情
 * Get single booking details
 */
export const getRoomBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    const user_id = req.user?.id;
    const is_admin = req.user?.role === 'admin';

    let query = `
      SELECT rb.*, r.room_number, rt.name as room_type_name, 
             rt.description, rt.images, rt.amenities,
             u.full_name as guest_name, u.email as guest_email, u.phone as guest_phone
      FROM room_bookings rb
      LEFT JOIN rooms r ON rb.room_id = r.id
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN users u ON rb.user_id = u.id
      WHERE rb.id = $1
    `;

    const params = [id];

    // 非管理员只能查看自己的预订
    if (!is_admin) {
      query += ' AND rb.user_id = $2';
      params.push(user_id);
    }

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: '预订不存在',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新预订状态
 * Update booking status
 */
export const updateRoomBookingStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const user_id = req.user?.id;
    const is_admin = req.user?.role === 'admin';

    if (!['pending', 'confirmed', 'cancelled', 'completed'].includes(status)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_STATUS',
          message: '无效的预订状态',
        },
      });
    }

    let query = 'UPDATE room_bookings SET status = $1 WHERE id = $2';
    const params = [status, id];

    // 非管理员只能取消自己的预订
    if (!is_admin) {
      if (status !== 'cancelled') {
        return res.status(403).json({
          success: false,
          error: {
            code: 'FORBIDDEN',
            message: '您没有权限执行此操作',
          },
        });
      }
      query += ' AND user_id = $3';
      params.push(user_id);
    }

    query += ' RETURNING *';

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'BOOKING_NOT_FOUND',
          message: '预订不存在或您没有权限修改',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: '预订状态已更新',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有预订 (管理员)
 * Get all bookings (admin)
 */
export const getAllRoomBookings = async (req, res, next) => {
  try {
    const { status, start_date, end_date } = req.query;

    let query = `
      SELECT rb.*, r.room_number, rt.name as room_type_name,
             u.full_name as guest_name, u.email as guest_email, u.phone as guest_phone
      FROM room_bookings rb
      LEFT JOIN rooms r ON rb.room_id = r.id
      LEFT JOIN room_types rt ON r.room_type_id = rt.id
      LEFT JOIN users u ON rb.user_id = u.id
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (status) {
      paramCount++;
      query += ` AND rb.status = $${paramCount}`;
      params.push(status);
    }

    if (start_date) {
      paramCount++;
      query += ` AND rb.check_in_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND rb.check_out_date <= $${paramCount}`;
      params.push(end_date);
    }

    query += ' ORDER BY rb.created_at DESC';

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};
