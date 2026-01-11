import app from './app.js';
import pool from './db/connection.js';
import websocketService from './services/websocketService.js';
import dotenv from 'dotenv';

dotenv.config();

const PORT = process.env.PORT || 3000;

// 启动服务器
const server = app.listen(PORT, async () => {
  console.log(`Server running on port ${PORT}`);
  
  try {
    // 验证数据库连接
    await pool.query('SELECT NOW()');
    console.log('Database connected successfully');
  } catch (err) {
    console.error('Database connection failed:', err);
    // 在生产环境中可能需要退出进程
    // process.exit(1);
  }

  // 初始化 WebSocket 服务
  websocketService.initialize(server);
  console.log('WebSocket service initialized');
});

// 优雅关闭
process.on('SIGTERM', () => {
  console.log('SIGTERM signal received: closing HTTP server');
  server.close(() => {
    console.log('HTTP server closed');
    pool.end();
  });
});
