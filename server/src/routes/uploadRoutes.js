import express from 'express';
import {
  upload,
  uploadImage,
  uploadMultipleImages,
  getUploadedImages,
  deleteImage,
  deleteMultipleImages,
} from '../controllers/uploadController.js';
import { authenticate as authenticateToken, requireAdmin } from '../middleware/auth.js';

const router = express.Router();

// 所有上传路由都需要管理员权限
router.post('/image', authenticateToken, requireAdmin, upload.single('image'), uploadImage);
router.post(
  '/images',
  authenticateToken,
  requireAdmin,
  upload.array('images', 10),
  uploadMultipleImages
);
router.get('/images', authenticateToken, requireAdmin, getUploadedImages);
router.delete('/image/:id', authenticateToken, requireAdmin, deleteImage);
router.delete('/images', authenticateToken, requireAdmin, deleteMultipleImages);

export default router;
