import { verifyToken } from '../utils/jwt.js';

/**
 * 身份验证中间件
 * Authentication middleware
 */
export const authenticate = (req, res, next) => {
  try {
    // 获取 Authorization header
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      const error = new Error('未授权访问 (Unauthorized access)');
      error.statusCode = 401;
      throw error;
    }

    // 提取并验证 token
    const token = authHeader.split(' ')[1];
    const decoded = verifyToken(token);

    // 将用户信息附加到请求对象
    req.user = decoded;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError' || error.name === 'TokenExpiredError') {
      error.statusCode = 401;
      error.message = '无效或过期的令牌 (Invalid or expired token)';
    }
    next(error);
  }
};

/**
 * 角色授权中间件
 * Role authorization middleware
 * @param {string[]} roles - 允许的角色列表
 */
export const authorize = (roles = []) => {
  return (req, res, next) => {
    if (!req.user) {
      const error = new Error('未授权 (Unauthorized)');
      error.statusCode = 401;
      return next(error);
    }

    if (roles.length && !roles.includes(req.user.role)) {
      const error = new Error('禁止访问: 权限不足 (Forbidden: Insufficient permissions)');
      error.statusCode = 403;
      return next(error);
    }

    next();
  };
};

/**
 * 管理员权限中间件
 * Admin authorization middleware
 */
export const requireAdmin = (req, res, next) => {
  if (!req.user) {
    const error = new Error('未授权 (Unauthorized)');
    error.statusCode = 401;
    return next(error);
  }

  if (req.user.role !== 'admin') {
    const error = new Error('禁止访问: 需要管理员权限 (Forbidden: Admin access required)');
    error.statusCode = 403;
    return next(error);
  }

  next();
};
