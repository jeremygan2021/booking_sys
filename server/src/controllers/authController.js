import bcrypt from 'bcryptjs';
import pool from '../db/connection.js';
import { generateToken } from '../utils/jwt.js';

/**
 * 用户注册
 * User Registration
 */
export const register = async (req, res, next) => {
  const { email, password, full_name, phone } = req.body;

  try {
    // 检查邮箱是否已存在
    const userCheck = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
    if (userCheck.rows.length > 0) {
      const error = new Error('该邮箱已被注册 (Email already registered)');
      error.statusCode = 409;
      throw error;
    }

    // 加密密码
    const salt = await bcrypt.genSalt(10);
    const passwordHash = await bcrypt.hash(password, salt);

    // 插入新用户
    const result = await pool.query(
      'INSERT INTO users (email, password_hash, full_name, phone) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email, passwordHash, full_name, phone]
    );

    const user = result.rows[0];

    // 生成 token
    const token = generateToken(user.id, user.role);

    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 用户登录
 * User Login
 */
export const login = async (req, res, next) => {
  const { email, password } = req.body;

  try {
    // 查找用户
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
    
    if (result.rows.length === 0) {
      const error = new Error('邮箱或密码错误 (Invalid email or password)');
      error.statusCode = 401;
      throw error;
    }

    const user = result.rows[0];

    // 验证密码
    const isMatch = await bcrypt.compare(password, user.password_hash);
    if (!isMatch) {
      const error = new Error('邮箱或密码错误 (Invalid email or password)');
      error.statusCode = 401;
      throw error;
    }

    // 生成 token
    const token = generateToken(user.id, user.role);

    res.status(200).json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        full_name: user.full_name,
        role: user.role
      }
    });
  } catch (error) {
    next(error);
  }
};

/**
 * 获取当前用户信息
 * Get Current User Profile
 */
export const getProfile = async (req, res, next) => {
  try {
    const result = await pool.query(
      'SELECT id, email, full_name, phone, role, created_at FROM users WHERE id = $1',
      [req.user.id]
    );

    if (result.rows.length === 0) {
      const error = new Error('用户不存在 (User not found)');
      error.statusCode = 404;
      throw error;
    }

    res.status(200).json({
      success: true,
      user: result.rows[0]
    });
  } catch (error) {
    next(error);
  }
};
