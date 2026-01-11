import pool from '../db/connection.js';

/**
 * 创建菜系
 */
export const createCuisine = async (req, res, next) => {
  try {
    const { name, description, image_url } = req.body;
    
    if (!name) {
      return res.status(400).json({
        success: false,
        error: { message: '菜系名称为必填项' }
      });
    }
    
    const result = await pool.query(
      'INSERT INTO cuisines (name, description, image_url) VALUES ($1, $2, $3) RETURNING *',
      [name, description, image_url]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '菜系创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新菜系
 */
export const updateCuisine = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;
    
    const checkResult = await pool.query(
      'SELECT * FROM cuisines WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '菜系不存在' }
      });
    }
    
    const updates = [];
    const params = [];
    let paramCount = 0;
    
    if (name !== undefined) {
      paramCount++;
      params.push(name);
      updates.push(`name = $${paramCount}`);
    }
    
    if (description !== undefined) {
      paramCount++;
      params.push(description);
      updates.push(`description = $${paramCount}`);
    }
    
    if (image_url !== undefined) {
      paramCount++;
      params.push(image_url);
      updates.push(`image_url = $${paramCount}`);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: '没有要更新的字段' }
      });
    }
    
    paramCount++;
    params.push(id);
    const query = `UPDATE cuisines SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: '菜系更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除菜系
 */
export const deleteCuisine = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 检查是否有套餐使用此菜系
    const packagesResult = await pool.query(
      'SELECT COUNT(*) as count FROM meal_packages WHERE cuisine_id = $1',
      [id]
    );
    
    if (parseInt(packagesResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: { message: '该菜系下还有套餐，无法删除' }
      });
    }
    
    const result = await pool.query(
      'DELETE FROM cuisines WHERE id = $1 RETURNING *',
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
      message: '菜系删除成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 创建套餐
 */
export const createMealPackage = async (req, res, next) => {
  try {
    const { name, description, price, cuisine_id, meal_type, max_guests } = req.body;
    
    if (!name || !price || !meal_type || !max_guests) {
      return res.status(400).json({
        success: false,
        error: { message: '套餐名称、价格、用餐类型和最大人数为必填项' }
      });
    }
    
    if (!['breakfast', 'lunch', 'dinner'].includes(meal_type)) {
      return res.status(400).json({
        success: false,
        error: { message: '用餐类型必须是 breakfast、lunch 或 dinner' }
      });
    }
    
    const result = await pool.query(
      `INSERT INTO meal_packages (name, description, price, cuisine_id, meal_type, max_guests)
       VALUES ($1, $2, $3, $4, $5, $6) RETURNING *`,
      [name, description, price, cuisine_id, meal_type, max_guests]
    );
    
    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '套餐创建成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 更新套餐
 */
export const updateMealPackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { name, description, price, cuisine_id, meal_type, max_guests } = req.body;
    
    const checkResult = await pool.query(
      'SELECT * FROM meal_packages WHERE id = $1',
      [id]
    );
    
    if (checkResult.rows.length === 0) {
      return res.status(404).json({
        success: false,
        error: { message: '套餐不存在' }
      });
    }
    
    if (meal_type && !['breakfast', 'lunch', 'dinner'].includes(meal_type)) {
      return res.status(400).json({
        success: false,
        error: { message: '用餐类型必须是 breakfast、lunch 或 dinner' }
      });
    }
    
    const updates = [];
    const params = [];
    let paramCount = 0;
    
    if (name !== undefined) {
      paramCount++;
      params.push(name);
      updates.push(`name = $${paramCount}`);
    }
    
    if (description !== undefined) {
      paramCount++;
      params.push(description);
      updates.push(`description = $${paramCount}`);
    }
    
    if (price !== undefined) {
      paramCount++;
      params.push(price);
      updates.push(`price = $${paramCount}`);
    }
    
    if (cuisine_id !== undefined) {
      paramCount++;
      params.push(cuisine_id);
      updates.push(`cuisine_id = $${paramCount}`);
    }
    
    if (meal_type !== undefined) {
      paramCount++;
      params.push(meal_type);
      updates.push(`meal_type = $${paramCount}`);
    }
    
    if (max_guests !== undefined) {
      paramCount++;
      params.push(max_guests);
      updates.push(`max_guests = $${paramCount}`);
    }
    
    if (updates.length === 0) {
      return res.status(400).json({
        success: false,
        error: { message: '没有要更新的字段' }
      });
    }
    
    paramCount++;
    params.push(id);
    const query = `UPDATE meal_packages SET ${updates.join(', ')} WHERE id = $${paramCount} RETURNING *`;
    
    const result = await pool.query(query, params);
    
    res.status(200).json({
      success: true,
      data: result.rows[0],
      message: '套餐更新成功'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 删除套餐
 */
export const deleteMealPackage = async (req, res, next) => {
  try {
    const { id } = req.params;
    
    // 检查是否有预订使用此套餐
    const bookingsResult = await pool.query(
      'SELECT COUNT(*) as count FROM restaurant_bookings WHERE package_id = $1',
      [id]
    );
    
    if (parseInt(bookingsResult.rows[0].count) > 0) {
      return res.status(400).json({
        success: false,
        error: { message: '该套餐已被预订使用，无法删除' }
      });
    }
    
    const result = await pool.query(
      'DELETE FROM meal_packages WHERE id = $1 RETURNING *',
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
      message: '套餐删除成功'
    });
  } catch (error) {
    next(error);
  }
};
