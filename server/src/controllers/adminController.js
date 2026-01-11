import pool from '../db/connection.js';

/**
 * Create time slot
 */
export const createTimeSlot = async (req, res) => {
  try {
    const { meal_type, start_time, end_time, max_capacity, is_active } = req.body;

    if (!meal_type || !start_time || !end_time || !max_capacity) {
      return res.status(400).json({ error: '缺少必填字段' });
    }

    const result = await pool.query(
      `INSERT INTO time_slots (meal_type, start_time, end_time, max_capacity, is_active)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING *`,
      [meal_type, start_time, end_time, max_capacity, is_active !== false]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '时间段创建成功',
    });
  } catch (error) {
    console.error('Create time slot error:', error);
    res.status(500).json({ error: '创建时间段失败' });
  }
};

/**
 * Update time slot
 */
export const updateTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;
    const { meal_type, start_time, end_time, max_capacity, is_active } = req.body;

    const result = await pool.query(
      `UPDATE time_slots
       SET meal_type = COALESCE($1, meal_type),
           start_time = COALESCE($2, start_time),
           end_time = COALESCE($3, end_time),
           max_capacity = COALESCE($4, max_capacity),
           is_active = COALESCE($5, is_active)
       WHERE id = $6
       RETURNING *`,
      [meal_type, start_time, end_time, max_capacity, is_active, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '时间段不存在' });
    }

    res.json({
      success: true,
      data: result.rows[0],
      message: '时间段更新成功',
    });
  } catch (error) {
    console.error('Update time slot error:', error);
    res.status(500).json({ error: '更新时间段失败' });
  }
};

/**
 * Delete time slot
 */
export const deleteTimeSlot = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query('DELETE FROM time_slots WHERE id = $1 RETURNING *', [id]);

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '时间段不存在' });
    }

    res.json({
      success: true,
      message: '时间段已删除',
    });
  } catch (error) {
    console.error('Delete time slot error:', error);
    res.status(500).json({ error: '删除时间段失败' });
  }
};
