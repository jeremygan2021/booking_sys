import pool from '../db/connection.js';
import { validationResult } from 'express-validator';

/**
 * 获取所有用餐房间
 * Get all dining rooms
 */
export const getDiningRooms = async (req, res, next) => {
  try {
    const { is_available, room_type } = req.query;

    let query = `
      SELECT id, name, description, room_type, capacity, facilities, images, 
             is_available, created_at, updated_at 
      FROM dining_rooms 
      WHERE 1=1
    `;

    const params = [];
    let paramCount = 0;

    if (is_available !== undefined) {
      paramCount++;
      query += ` AND is_available = $${paramCount}`;
      params.push(is_available === 'true');
    }

    if (room_type) {
      paramCount++;
      query += ` AND room_type = $${paramCount}`;
      params.push(room_type);
    }

    query += ' ORDER BY capacity ASC';

    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: result.rows,
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个用餐房间详情
 * Get single dining room details
 */
export const getDiningRoomById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `SELECT id, name, description, room_type, capacity, facilities, images, 
              is_available, created_at, updated_at 
       FROM dining_rooms 
       WHERE id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DINING_ROOM_NOT_FOUND',
          message: '用餐房间不存在',
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
 * 检查用餐房间在指定日期和时间段的可用性
 * Check dining room availability for specific date and time
 */
export const checkDiningRoomAvailability = async (req, res, next) => {
  try {
    const { booking_date, meal_type, time_slot } = req.query;

    if (!booking_date || !meal_type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'MISSING_PARAMETERS',
          message: '请提供预订日期和用餐类型',
        },
      });
    }

    // 查询可用的用餐房间
    const query = `
      SELECT dr.id, dr.name, dr.description, dr.room_type, dr.capacity, 
             dr.facilities, dr.images,
             COALESCE(SUM(rb.guest_count), 0) as booked_guests,
             dr.capacity - COALESCE(SUM(rb.guest_count), 0) as available_capacity
      FROM dining_rooms dr
      LEFT JOIN restaurant_bookings rb ON dr.id = rb.dining_room_id
        AND rb.booking_date = $1
        AND rb.meal_type = $2
        AND rb.status IN ('pending', 'confirmed')
        ${time_slot ? 'AND rb.time_slot = $3' : ''}
      WHERE dr.is_available = true
      GROUP BY dr.id
      HAVING dr.capacity > COALESCE(SUM(rb.guest_count), 0)
      ORDER BY dr.capacity ASC
    `;

    const params = time_slot ? [booking_date, meal_type, time_slot] : [booking_date, meal_type];
    const result = await pool.query(query, params);

    res.status(200).json({
      success: true,
      data: {
        available_rooms: result.rows,
        booking_date,
        meal_type,
        time_slot: time_slot || null,
      },
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建用餐房间 (管理员)
 * Create dining room (admin)
 */
export const createDiningRoom = async (req, res, next) => {
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

    const { name, description, room_type, capacity, facilities, images, is_available } = req.body;

    // 验证房间类型
    const validRoomTypes = ['mahjong', 'private', 'public', 'tea_room', 'garden', 'other'];
    if (!validRoomTypes.includes(room_type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'INVALID_ROOM_TYPE',
          message: '无效的房间类型',
        },
      });
    }

    const result = await pool.query(
      `INSERT INTO dining_rooms (name, description, room_type, capacity, facilities, images, is_available)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING *`,
      [
        name, 
        description, 
        room_type, 
        capacity, 
        facilities || [], 
        images || [], 
        is_available !== undefined ? is_available : true
      ]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '用餐房间创建成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新用餐房间 (管理员)
 * Update dining room (admin)
 */
export const updateDiningRoom = async (req, res, next) => {
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
    const { name, description, room_type, capacity, facilities, images, is_available } = req.body;

    // 验证房间类型
    if (room_type) {
      const validRoomTypes = ['mahjong', 'private', 'public', 'tea_room', 'garden', 'other'];
      if (!validRoomTypes.includes(room_type)) {
        return res.status(400).json({
          success: false,
          error: {
            code: 'INVALID_ROOM_TYPE',
            message: '无效的房间类型',
          },
        });
      }
    }

    const result = await pool.query(
      `UPDATE dining_rooms 
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           room_type = COALESCE($3, room_type),
           capacity = COALESCE($4, capacity),
           facilities = COALESCE($5, facilities),
           images = COALESCE($6, images),
           is_available = COALESCE($7, is_available)
       WHERE id = $8
       RETURNING *`,
      [name, description, room_type, capacity, facilities, images, is_available, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DINING_ROOM_NOT_FOUND',
          message: '用餐房间不存在',
        },
      });
    }

    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: '用餐房间更新成功',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除用餐房间 (管理员)
 * Delete dining room (admin)
 */
export const deleteDiningRoom = async (req, res, next) => {
  try {
    const { id } = req.params;

    // 检查是否有关联的预订
    const bookingCheck = await pool.query(
      `SELECT COUNT(*) as count 
       FROM restaurant_bookings 
       WHERE dining_room_id = $1 AND status IN ('pending', 'confirmed')`,
      [id]
    );

    if (parseInt(bookingCheck.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'HAS_ACTIVE_BOOKINGS',
          message: '该房间有未完成的预订，无法删除',
        },
      });
    }

    const result = await pool.query(
      'DELETE FROM dining_rooms WHERE id = $1 RETURNING id',
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DINING_ROOM_NOT_FOUND',
          message: '用餐房间不存在',
        },
      });
    }

    res.status(200).json({
      success: true,
      message: '用餐房间已删除',
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取用餐房间的预订统计 (管理员)
 * Get dining room booking statistics (admin)
 */
export const getDiningRoomStatistics = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { start_date, end_date } = req.query;

    let query = `
      SELECT 
        dr.id,
        dr.name,
        dr.capacity,
        COUNT(rb.id) as total_bookings,
        SUM(rb.guest_count) as total_guests,
        AVG(rb.guest_count) as avg_guests_per_booking
      FROM dining_rooms dr
      LEFT JOIN restaurant_bookings rb ON dr.id = rb.dining_room_id
        AND rb.status IN ('confirmed', 'completed')
    `;

    const params = [id];
    let paramCount = 1;

    if (start_date) {
      paramCount++;
      query += ` AND rb.booking_date >= $${paramCount}`;
      params.push(start_date);
    }

    if (end_date) {
      paramCount++;
      query += ` AND rb.booking_date <= $${paramCount}`;
      params.push(end_date);
    }

    query += `
      WHERE dr.id = $1
      GROUP BY dr.id, dr.name, dr.capacity
    `;

    const result = await pool.query(query, params);

    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'DINING_ROOM_NOT_FOUND',
          message: '用餐房间不存在',
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

export default {
  getDiningRooms,
  getDiningRoomById,
  checkDiningRoomAvailability,
  createDiningRoom,
  updateDiningRoom,
  deleteDiningRoom,
  getDiningRoomStatistics,
};
