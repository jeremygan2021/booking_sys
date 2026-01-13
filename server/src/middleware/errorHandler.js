/**
 * 统一错误处理中间件
 * Centralized error handling middleware
 */
export const errorHandler = (err, req, res, next) => {
  console.error('Error:', err);

  // 默认错误状态码和消息
  const status = err.statusCode || 500;
  const message = err.message || 'Internal Server Error';

  // 构建错误响应
  const response = {
    success: false,
    error: {
      code: err.code || status.toString(),
      message,
      timestamp: new Date().toISOString(),
      ...(process.env.NODE_ENV === 'development' && { 
        stack: err.stack,
        details: err.details 
      }),
    },
  };

  res.status(status).json(response);
};

/**
 * 404 未找到处理
 * 404 Not Found handler
 */
export const notFoundHandler = (req, res, next) => {
  const error = new Error(`Not Found - ${req.originalUrl}`);
  error.statusCode = 404;
  error.code = 'NOT_FOUND';
  next(error);
};

/**
 * 创建自定义错误
 * Create custom error
 */
export class AppError extends Error {
  constructor(message, statusCode = 500, code = 'INTERNAL_ERROR', details = null) {
    super(message);
    this.statusCode = statusCode;
    this.code = code;
    this.details = details;
    Error.captureStackTrace(this, this.constructor);
  }
}

