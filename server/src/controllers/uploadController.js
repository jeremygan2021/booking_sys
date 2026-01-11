import pool from '../db/connection.js';
import multer from 'multer';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 确保上传目录存在
const uploadDir = path.join(__dirname, '../../uploads');
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

// 配置 multer 存储
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadDir);
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    cb(null, file.fieldname + '-' + uniqueSuffix + ext);
  },
});

// 文件过滤器 - 只允许图片
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|gif|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (mimetype && extname) {
    return cb(null, true);
  } else {
    cb(new Error('只允许上传图片文件 (jpeg, jpg, png, gif, webp)'));
  }
};

// 配置 multer
export const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB
  },
  fileFilter: fileFilter,
});

/**
 * 上传单个图片
 */
export const uploadImage = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const { filename, originalname, mimetype, size } = req.file;
    const filePath = `/uploads/${filename}`;
    const userId = req.user?.id || null;

    // 保存文件信息到数据库
    const result = await pool.query(
      `INSERT INTO uploaded_files (filename, original_name, file_path, file_size, mime_type, uploaded_by)
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [filename, originalname, filePath, size, mimetype, userId]
    );

    res.status(201).json({
      success: true,
      data: result.rows[0],
      message: '图片上传成功',
    });
  } catch (error) {
    console.error('Upload image error:', error);
    res.status(500).json({ error: '图片上传失败' });
  }
};

/**
 * 上传多个图片
 */
export const uploadMultipleImages = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({ error: '没有上传文件' });
    }

    const userId = req.user?.id || null;
    const uploadedFiles = [];

    for (const file of req.files) {
      const { filename, originalname, mimetype, size } = file;
      const filePath = `/uploads/${filename}`;

      const result = await pool.query(
        `INSERT INTO uploaded_files (filename, original_name, file_path, file_size, mime_type, uploaded_by)
         VALUES ($1, $2, $3, $4, $5, $6)
         RETURNING *`,
        [filename, originalname, filePath, size, mimetype, userId]
      );

      uploadedFiles.push(result.rows[0]);
    }

    res.status(201).json({
      success: true,
      data: uploadedFiles,
      message: `成功上传 ${uploadedFiles.length} 个图片`,
    });
  } catch (error) {
    console.error('Upload multiple images error:', error);
    res.status(500).json({ error: '图片上传失败' });
  }
};

/**
 * 获取所有上传的图片
 */
export const getUploadedImages = async (req, res) => {
  try {
    const { limit = 50, offset = 0 } = req.query;

    const result = await pool.query(
      `SELECT uf.*, u.full_name as uploader_name
       FROM uploaded_files uf
       LEFT JOIN users u ON uf.uploaded_by = u.id
       ORDER BY uf.created_at DESC
       LIMIT $1 OFFSET $2`,
      [limit, offset]
    );

    const countResult = await pool.query('SELECT COUNT(*) FROM uploaded_files');
    const total = parseInt(countResult.rows[0].count);

    res.json({
      success: true,
      data: result.rows,
      pagination: {
        total,
        limit: parseInt(limit),
        offset: parseInt(offset),
      },
    });
  } catch (error) {
    console.error('Get uploaded images error:', error);
    res.status(500).json({ error: '获取图片列表失败' });
  }
};

/**
 * 删除图片
 */
export const deleteImage = async (req, res) => {
  try {
    const { id } = req.params;

    // 获取文件信息
    const fileResult = await pool.query('SELECT * FROM uploaded_files WHERE id = $1', [id]);

    if (fileResult.rows.length === 0) {
      return res.status(404).json({ error: '图片不存在' });
    }

    const file = fileResult.rows[0];

    // 删除物理文件
    const fullPath = path.join(__dirname, '../..', file.file_path);
    if (fs.existsSync(fullPath)) {
      fs.unlinkSync(fullPath);
    }

    // 从数据库删除记录
    await pool.query('DELETE FROM uploaded_files WHERE id = $1', [id]);

    res.json({
      success: true,
      message: '图片已删除',
    });
  } catch (error) {
    console.error('Delete image error:', error);
    res.status(500).json({ error: '删除图片失败' });
  }
};

/**
 * 批量删除图片
 */
export const deleteMultipleImages = async (req, res) => {
  try {
    const { ids } = req.body;

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return res.status(400).json({ error: '请提供要删除的图片ID列表' });
    }

    // 获取所有文件信息
    const filesResult = await pool.query(
      'SELECT * FROM uploaded_files WHERE id = ANY($1::uuid[])',
      [ids]
    );

    // 删除物理文件
    for (const file of filesResult.rows) {
      const fullPath = path.join(__dirname, '../..', file.file_path);
      if (fs.existsSync(fullPath)) {
        fs.unlinkSync(fullPath);
      }
    }

    // 从数据库删除记录
    const result = await pool.query(
      'DELETE FROM uploaded_files WHERE id = ANY($1::uuid[]) RETURNING id',
      [ids]
    );

    res.json({
      success: true,
      message: `成功删除 ${result.rows.length} 个图片`,
      deleted_count: result.rows.length,
    });
  } catch (error) {
    console.error('Delete multiple images error:', error);
    res.status(500).json({ error: '批量删除图片失败' });
  }
};
