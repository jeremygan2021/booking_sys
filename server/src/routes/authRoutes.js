import express from 'express';
import { body } from 'express-validator';
import { register, login, getProfile } from '../controllers/authController.js';
import { authenticate } from '../middleware/auth.js';

const router = express.Router();

/**
 * 注册路由验证规则
 * Registration validation rules
 */
const registerValidation = [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').isLength({ min: 6 }).withMessage('密码长度至少为6位'),
  body('full_name').notEmpty().withMessage('请输入姓名'),
];

/**
 * 登录路由验证规则
 * Login validation rules
 */
const loginValidation = [
  body('email').isEmail().withMessage('请输入有效的邮箱地址'),
  body('password').exists().withMessage('请输入密码'),
];

// 路由定义
router.post('/register', registerValidation, register);
router.post('/login', loginValidation, login);
router.get('/me', authenticate, getProfile);

export default router;
