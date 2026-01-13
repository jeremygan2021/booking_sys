import pool from '../db/connection.js';
import websocketService from '../services/websocketService.js';

/**
 * 获取所有菜系
 */
export const getCuisines = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT * FROM cuisines ORDER BY created_at DESC'
    );
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个菜系详情
 */
export const getCuisineById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'SELECT * FROM cuisines WHERE id = $1',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '菜系不存在' }
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取所有套餐
 */
export const getMealPackages = async (req, res, next) => {
  try {
    const { meal_type, cuisine_id } = req.query;
    
    let query = `
      SELECT mp.*, c.name as cuisine_name, c.description as cuisine_description
      FROM meal_packages mp
      LEFT JOIN cuisines c ON mp.cuisine_id = c.id
      WHERE 1=1
    `;
    const params = [];
    
    if (meal_type) {
      params.push(meal_type);
      query += ` AND mp.meal_type = ${params.length}`;
    }
    
    if (cuisine_id) {
      params.push(cuisine_id);
      query += ` AND mp.cuisine_id = ${params.length}`;
    }
    
    query += ' ORDER BY mp.price ASC';
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个套餐详情
 */
export const getMealPackageById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT mp.*, c.name as cuisine_name, c.description as cuisine_description
       FROM meal_packages mp
       LEFT JOIN cuisines c ON mp.cuisine_id = c.id
       WHERE mp.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '套餐不存在' }
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取时间段配置
 */
export const getTimeSlots = async (req, res, next) => {
  try {
    const { meal_type } = req.query;
    
    let query = 'SELECT * FROM time_slots WHERE is_active = true';
    const params = [];
    
    if (meal_type) {
      params.push(meal_type);
      query += ` AND meal_type = $${params.length}`;
    }
    
    query += ' ORDER BY meal_type, start_time ASC';
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 检查餐厅可用性
 */
export const checkAvailability = async (req, res, next) => {
  try {
    const { date, meal_type } = req.query;
    
    if (!date || !meal_type) {
      return res.status(400).json({
        success: false,
        error: { message: '日期和用餐类型为必填项' }
      });
    }
    
    // 获取该用餐类型的时间段配置
    const timeSlotsResult = await pool.query(
      'SELECT * FROM time_slots WHERE meal_type = $1 AND is_active = true ORDER BY start_time',
      [meal_type]
    );
    
    if (timeSlotsResult.rows.length === 0) {
      return res.status(200).json({
        success: true,
        data: {
          date,
          meal_type,
          available_slots: []
        }
      });
    }
    
    // 获取该日期已有的预订
    const bookingsResult = await pool.query(
      `SELECT time_slot, SUM(guest_count) as total_guests
       FROM restaurant_bookings
       WHERE booking_date = $1 AND meal_type = $2 AND status != 'cancelled'
       GROUP BY time_slot`,
      [date, meal_type]
    );
    
    const bookingsByTime = {};
    bookingsResult.rows.forEach(row => {
      bookingsByTime[row.time_slot] = parseInt(row.total_guests);
    });
    
    // 计算每个时间段的可用性
    const availableSlots = timeSlotsResult.rows.map(slot => {
      const bookedGuests = bookingsByTime[slot.start_time] || 0;
      const availableCapacity = slot.max_capacity - bookedGuests;
      
      return {
        id: slot.id,
        start_time: slot.start_time,
        end_time: slot.end_time,
        max_capacity: slot.max_capacity,
        booked_guests: bookedGuests,
        available_capacity: availableCapacity,
        is_available: availableCapacity > 0
      };
    });
    
    res.status(200).json({
      success: true,
      data: {
        date,
        meal_type,
        available_slots: availableSlots
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建访客餐厅预订（无需认证）
 */
export const createGuestRestaurantBooking = async (req, res, next) => {
  try {
    const {
      booking_date,
      meal_type,
      time_slot_id,
      guest_name,
      guest_phone,
      guest_count,
      package_id,
      dining_room_id,
      total_price,
      special_requests
    } = req.body;
    
    // 验证必填字段
    if (!booking_date || !meal_type || !time_slot_id || !guest_name || !guest_phone || !guest_count || !total_price) {
      return res.status(400).json({
        success: false,
        error: { message: '缺少必填字段' }
      });
    }
    
    // 验证手机号格式
    if (!/^[0-9]{11}$/.test(guest_phone)) {
      return res.status(400).json({
        success: false,
        error: { message: '请输入有效的11位手机号码' }
      });
    }
    
    // 检查时间段是否存在且可用
    const timeSlotResult = await pool.query(
      'SELECT * FROM time_slots WHERE id = $1 AND meal_type = $2 AND is_active = true',
      [time_slot_id, meal_type]
    );
    
    if (timeSlotResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: '选择的时间段不可用' }
      });
    }
    
    const timeSlotConfig = timeSlotResult.rows[0];
    
    // 如果选择了用餐房间，检查房间容量和可用性
    if (dining_room_id) {
      const roomResult = await pool.query(
        'SELECT * FROM dining_rooms WHERE id = $1 AND is_available = true',
        [dining_room_id]
      );
      
      if (roomResult.rows.length === 0) {
        return res.status(400).json({
          success: false,
          error: { message: '选择的用餐房间不可用' }
        });
      }
      
      const room = roomResult.rows[0];
      
      // 检查客人数量是否超过房间容量
      if (guest_count > room.capacity) {
        return res.status(400).json({
          success: false,
          error: { 
            message: `客人数量超过房间最大容纳人数 (${room.capacity})`,
            max_capacity: room.capacity
          }
        });
      }
      
      // 检查该房间在该时间段是否已被预订
      const roomBookingResult = await pool.query(
        `SELECT COALESCE(SUM(guest_count), 0) as total_guests
         FROM restaurant_bookings
         WHERE booking_date = $1 AND meal_type = $2 AND time_slot = $3 
           AND dining_room_id = $4 AND status != 'cancelled'`,
        [booking_date, meal_type, timeSlotConfig.start_time, dining_room_id]
      );
      
      const roomCurrentGuests = parseInt(roomBookingResult.rows[0].total_guests);
      const roomAvailableCapacity = room.capacity - roomCurrentGuests;
      
      if (guest_count > roomAvailableCapacity) {
        return res.status(400).json({
          success: false,
          error: { 
            message: '该房间在此时间段容量不足',
            available_capacity: roomAvailableCapacity
          }
        });
      }
    }
    
    // 检查该时间段的总容量
    const bookingsResult = await pool.query(
      `SELECT COALESCE(SUM(guest_count), 0) as total_guests
       FROM restaurant_bookings
       WHERE booking_date = $1 AND meal_type = $2 AND time_slot = $3 AND status != 'cancelled'`,
      [booking_date, meal_type, timeSlotConfig.start_time]
    );
    
    const currentGuests = parseInt(bookingsResult.rows[0].total_guests);
    const availableCapacity = timeSlotConfig.max_capacity - currentGuests;
    
    if (guest_count > availableCapacity) {
      return res.status(400).json({
        success: false,
        error: { 
          message: '该时间段容量不足',
          available_capacity: availableCapacity
        }
      });
    }
    
    // 创建预订（不关联用户）
    const result = await pool.query(
      `INSERT INTO restaurant_bookings 
       (booking_date, meal_type, time_slot, guest_name, guest_phone, guest_count, package_id, dining_room_id, total_price, special_requests, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, 'pending')
       RETURNING *`,
      [booking_date, meal_type, timeSlotConfig.start_time, guest_name, guest_phone, guest_count, package_id, dining_room_id, total_price, special_requests]
    );
    
    const booking = result.rows[0];

    // Notify via WebSocket
    websocketService.notifyBookingCreated(booking, 'restaurant');
    websocketService.notifyAvailabilityChanged(booking_date, 'restaurant');
    
    res.status(201).json({
      success: true,
      data: booking,
      message: '预订创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建餐厅预订
 */
export const createRestaurantBooking = async (req, res, next) => {
  try {
    const {
      user_id,
      booking_date,
      meal_type,
      time_slot,
      guest_count,
      package_id,
      total_price,
      special_requests
    } = req.body;
    
    // 验证必填字段
    if (!booking_date || !meal_type || !time_slot || !guest_count || !total_price) {
      return res.status(400).json({
        success: false,
        error: { message: '缺少必填字段' }
      });
    }
    
    // 检查时间段是否存在且可用
    const timeSlotResult = await pool.query(
      'SELECT * FROM time_slots WHERE meal_type = $1 AND start_time = $2 AND is_active = true',
      [meal_type, time_slot]
    );
    
    if (timeSlotResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: '选择的时间段不可用' }
      });
    }
    
    const timeSlotConfig = timeSlotResult.rows[0];
    
    // 检查该时间段的容量
    const bookingsResult = await pool.query(
      `SELECT COALESCE(SUM(guest_count), 0) as total_guests
       FROM restaurant_bookings
       WHERE booking_date = $1 AND meal_type = $2 AND time_slot = $3 AND status != 'cancelled'`,
      [booking_date, meal_type, time_slot]
    );
    
    const currentGuests = parseInt(bookingsResult.rows[0].total_guests);
    const availableCapacity = timeSlotConfig.max_capacity - currentGuests;
    
    if (guest_count > availableCapacity) {
      return res.status(400).json({
        success: false,
        error: { 
          message: '该时间段容量不足',
          available_capacity: availableCapacity
        }
      });
    }
    
    // 创建预订
    const result = await pool.query(
      `INSERT INTO restaurant_bookings 
       (user_id, booking_date, meal_type, time_slot, guest_count, package_id, total_price, special_requests, status)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, 'pending')
       RETURNING *`,
      [user_id, booking_date, meal_type, time_slot, guest_count, package_id, total_price, special_requests]
    );
    
    const booking = result.rows[0];

    // Notify via WebSocket
    websocketService.notifyBookingCreated(booking, 'restaurant');
    websocketService.notifyAvailabilityChanged(booking_date, 'restaurant');
    
    res.status(201).json({
      success: true,
      data: booking,
      message: '预订创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取餐厅预订列表
 */
export const getRestaurantBookings = async (req, res, next) => {
  try {
    const { user_id, status, date, meal_type, phone } = req.query;
    
    let query = `
      SELECT rb.*, mp.name as package_name, mp.price as package_price,
             COALESCE(rb.guest_name, u.full_name) as user_name,
             u.email as user_email,
             COALESCE(rb.guest_phone, u.phone) as user_phone
      FROM restaurant_bookings rb
      LEFT JOIN meal_packages mp ON rb.package_id = mp.id
      LEFT JOIN users u ON rb.user_id = u.id
      WHERE 1=1
    `;
    const params = [];
    
    // 电话号码搜索优先
    if (phone) {
      params.push(`%${phone}%`);
      query += ` AND (rb.guest_phone LIKE ${params.length} OR u.phone LIKE ${params.length})`;
    }
    
    if (user_id) {
      params.push(user_id);
      query += ` AND rb.user_id = ${params.length}`;
    }
    
    if (status) {
      params.push(status);
      query += ` AND rb.status = ${params.length}`;
    }
    
    if (date) {
      params.push(date);
      query += ` AND rb.booking_date = ${params.length}`;
    }
    
    if (meal_type) {
      params.push(meal_type);
      query += ` AND rb.meal_type = ${params.length}`;
    }
    
    query += ' ORDER BY rb.booking_date DESC, rb.time_slot DESC';
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      data: result.rows
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取单个餐厅预订详情
 */
export const getRestaurantBookingById = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      `SELECT rb.*, mp.name as package_name, mp.price as package_price,
              u.full_name as user_name, u.email as user_email, u.phone as user_phone
       FROM restaurant_bookings rb
       LEFT JOIN meal_packages mp ON rb.package_id = mp.id
       LEFT JOIN users u ON rb.user_id = u.id
       WHERE rb.id = $1`,
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '预订不存在' }
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新餐厅预订
 */
export const updateRestaurantBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, special_requests } = req.body;
    
    // 检查预订是否存在
    const checkResult = await pool.query(
      'SELECT * FROM restaurant_bookings WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '预订不存在' }
      });
    }
    
    const updates = [];
    const params = [];
    if (status) {
      params.push(status);
      updates.push(`status = ${params.length}`);
    }
    
    if (special_requests !== undefined) {
      params.push(special_requests);
      updates.push(`special_requests = ${params.length}`);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: '没有要更新的字段' }
      });
    }
    
    params.push(id);
    const query = `
      UPDATE restaurant_bookings 
      SET ${updates.join(', ')}
      WHERE id = ${params.length}
      RETURNING *
    `;
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: '预订更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除餐厅预订
 */
export const deleteRestaurantBooking = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    const result = await pool.query(
      'DELETE FROM restaurant_bookings WHERE id = $1 RETURNING *',
      [id]
    );
    
    if (result.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '预订不存在' }
      });
    }
    
    res.status(200).json({
      success: true,
      message: '预订删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取餐厅内容
 */
export const getRestaurantContent = async (req, res, next) => {
  try {
    const result = await pool.query(
      "SELECT * FROM content_sections WHERE section_key = 'restaurant'"
    );
    
    if (result.rows.length === 0) {
      // 返回默认内容
      return res.status(200).json({
        success: true,
        data: {
          section_key: 'restaurant',
          title: '餐厅',
          content: '',
          images: [],
          metadata: {}
        }
      });
    }
    
    res.status(200).json({
      success: true,
      data: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
