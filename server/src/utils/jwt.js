import jwt from 'jsonwebtoken';

/**
 * 生成 JWT 令牌
 * Generate JWT token
 * @param {string} userId - 用户ID
 * @param {string} role - 用户角色
 * @returns {string} JWT token
 */
export const generateToken = (userId, role) => {
  return jwt.sign(
    { id: userId, role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

/**
 * 验证 JWT 令牌
 * Verify JWT token
 * @param {string} token - JWT token
 * @returns {object} 解码后的 payload
 */
export const verifyToken = (token) => {
  return jwt.verify(token, process.env.JWT_SECRET);
};
