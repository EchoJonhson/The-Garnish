import { Request, Response, NextFunction } from 'express';
import jwt, { SignOptions } from 'jsonwebtoken';
import { User } from '../models';

// 扩展Request接口，添加user属性
declare global {
  namespace Express {
    interface Request {
      user?: User;
    }
  }
}

// JWT载荷接口
interface JWTPayload {
  userId: number;
  username: string;
  role: string;
}

// 认证中间件
export const authenticateToken = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Bearer TOKEN

    if (!token) {
      res.status(401).json({
        success: false,
        message: '访问令牌缺失'
      });
      return;
    }

    // 验证JWT令牌
    const decoded = jwt.verify(token, process.env.JWT_SECRET!) as JWTPayload;
    
    // 查找用户
    const user = await User.findByPk(decoded.userId);
    if (!user || !user.is_active) {
      res.status(401).json({
        success: false,
        message: '用户不存在或已被禁用'
      });
      return;
    }

    // 将用户信息添加到请求对象
    req.user = user;
    next();
  } catch (error) {
    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: '无效的访问令牌'
      });
    } else if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: '访问令牌已过期'
      });
    } else {
      res.status(500).json({
        success: false,
        message: '认证过程中发生错误'
      });
    }
  }
};

// 角色权限中间件
export const requireRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction): void => {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '用户未认证'
      });
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(403).json({
        success: false,
        message: '权限不足'
      });
      return;
    }

    next();
  };
};

// 仅店长权限
export const requireOwner = requireRole(['owner']);

// 店长或调酒师权限
export const requireOwnerOrBartender = requireRole(['owner', 'bartender']);

// 生成JWT令牌
export const generateToken = (user: User): string => {
  const payload: JWTPayload = {
    userId: user.id,
    username: user.username,
    role: user.role
  };

  const options: SignOptions = {
    expiresIn: '7d'
  };
  
  return jwt.sign(payload, process.env.JWT_SECRET!, options);
};