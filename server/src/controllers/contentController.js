import pool from '../db/connection.js';

// Get restaurant content
export const getRestaurantContent = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM content_sections WHERE section_key = 'restaurant_intro'`
    );

    if (result.rows.length === 0) {
      return res.json({
        section_key: 'restaurant_intro',
        content: '<p>欢迎来到爱云香舍餐厅，这里提供精致的法式料理...</p>',
      });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Get restaurant content error:', error);
    res.status(500).json({ error: '获取餐厅内容失败' });
  }
};

// Update restaurant content
export const updateRestaurantContent = async (req, res) => {
  try {
    const { content, images } = req.body;

    if (!content) {
      return res.status(400).json({ error: '内容不能为空' });
    }

    // 确保images是数组格式
    const imagesArray = Array.isArray(images) ? images : [];

    const result = await pool.query(
      `INSERT INTO content_sections (section_key, content, images, updated_at)
       VALUES ('restaurant_intro', $1, $2::jsonb, CURRENT_TIMESTAMP)
       ON CONFLICT (section_key)
       DO UPDATE SET content = $1, images = $2::jsonb, updated_at = CURRENT_TIMESTAMP
       RETURNING *`,
      [content, JSON.stringify(imagesArray)]
    );

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update restaurant content error:', error);
    res.status(500).json({ error: '更新餐厅内容失败' });
  }
};

// Get all cuisines
export const getCuisines = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM cuisines ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get cuisines error:', error);
    res.status(500).json({ error: '获取菜系列表失败' });
  }
};

// Create cuisine
export const createCuisine = async (req, res) => {
  try {
    const { name, description, image_url } = req.body;

    if (!name) {
      return res.status(400).json({ error: '菜系名称不能为空' });
    }

    const result = await pool.query(
      `INSERT INTO cuisines (name, description, image_url)
       VALUES ($1, $2, $3)
       RETURNING *`,
      [name, description, image_url]
    );

    res.status(201).json(result.rows[0]);
  } catch (error) {
    console.error('Create cuisine error:', error);
    res.status(500).json({ error: '创建菜系失败' });
  }
};

// Update cuisine
export const updateCuisine = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, image_url } = req.body;

    const result = await pool.query(
      `UPDATE cuisines
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           image_url = COALESCE($3, image_url),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $4
       RETURNING *`,
      [name, description, image_url, id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '菜系不存在' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update cuisine error:', error);
    res.status(500).json({ error: '更新菜系失败' });
  }
};

// Delete cuisine
export const deleteCuisine = async (req, res) => {
  try {
    const { id } = req.params;

    const result = await pool.query(
      `DELETE FROM cuisines WHERE id = $1 RETURNING *`,
      [id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '菜系不存在' });
    }

    res.json({ message: '菜系已删除', cuisine: result.rows[0] });
  } catch (error) {
    console.error('Delete cuisine error:', error);
    res.status(500).json({ error: '删除菜系失败' });
  }
};

// Get all room types
export const getRoomTypes = async (req, res) => {
  try {
    const result = await pool.query(
      `SELECT * FROM room_types ORDER BY created_at DESC`
    );
    res.json(result.rows);
  } catch (error) {
    console.error('Get room types error:', error);
    res.status(500).json({ error: '获取房间类型失败' });
  }
};

// Update room type
export const updateRoomType = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, description, base_price, max_occupancy, amenities, images } = req.body;

    console.log('Updating room type:', { id, name, images }); // 调试日志

    // 确保images是数组格式
    const imagesArray = Array.isArray(images) ? images : (images ? [images] : null);
    const amenitiesArray = Array.isArray(amenities) ? amenities : (amenities ? [amenities] : null);

    const result = await pool.query(
      `UPDATE room_types
       SET name = COALESCE($1, name),
           description = COALESCE($2, description),
           base_price = COALESCE($3, base_price),
           max_occupancy = COALESCE($4, max_occupancy),
           amenities = COALESCE($5::jsonb, amenities),
           images = COALESCE($6::jsonb, images),
           updated_at = CURRENT_TIMESTAMP
       WHERE id = $7
       RETURNING *`,
      [name, description, base_price, max_occupancy, JSON.stringify(amenitiesArray), JSON.stringify(imagesArray), id]
    );

    if (result.rows.length === 0) {
      return res.status(404).json({ error: '房间类型不存在' });
    }

    res.json(result.rows[0]);
  } catch (error) {
    console.error('Update room type error:', error);
    console.error('Error details:', error.message); // 详细错误信息
    res.status(500).json({ error: '更新房间类型失败', details: error.message });
  }
};
