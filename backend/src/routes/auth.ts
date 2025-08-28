import { Router } from 'express';
import {
  login,
  getCurrentUser,
  createUser,
  getUsers,
  updateUserStatus
} from '../controllers/authController';
import { authenticateToken, requireOwner } from '../middleware/auth';

const router = Router();

// 公开路由
router.post('/login', login);

// 需要认证的路由
router.get('/me', authenticateToken, getCurrentUser);

// 仅店长权限的路由
router.post('/users', authenticateToken, requireOwner, createUser);
router.get('/users', authenticateToken, requireOwner, getUsers);
router.put('/users/:id/status', authenticateToken, requireOwner, updateUserStatus);

export default router;