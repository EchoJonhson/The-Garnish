import { Request, Response } from 'express';
import { User } from '../models';
import { generateToken } from '../middleware/auth';

// 登录接口
export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password } = req.body;

    // 验证输入
    if (!username || !password) {
      res.status(400).json({
        success: false,
        message: '用户名和密码不能为空'
      });
      return;
    }

    // 查找用户
    const user = await User.findOne({ where: { username } });
    if (!user) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
      return;
    }

    // 检查用户是否激活
    if (!user.is_active) {
      res.status(401).json({
        success: false,
        message: '用户账号已被禁用'
      });
      return;
    }

    // 验证密码
    const isValidPassword = await user.validatePassword(password);
    if (!isValidPassword) {
      res.status(401).json({
        success: false,
        message: '用户名或密码错误'
      });
      return;
    }

    // 生成JWT令牌
    const token = generateToken(user);

    // 返回成功响应
    res.json({
      success: true,
      message: '登录成功',
      token,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role
      }
    });
  } catch (error) {
    console.error('登录错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取当前用户信息
export const getCurrentUser = async (req: Request, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({
        success: false,
        message: '用户未认证'
      });
      return;
    }

    res.json({
      success: true,
      user: {
        id: req.user.id,
        username: req.user.username,
        name: req.user.name,
        role: req.user.role,
        created_at: req.user.created_at
      }
    });
  } catch (error) {
    console.error('获取用户信息错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 创建用户（仅店长权限）
export const createUser = async (req: Request, res: Response): Promise<void> => {
  try {
    const { username, password, name, role } = req.body;

    // 验证输入
    if (!username || !password || !name || !role) {
      res.status(400).json({
        success: false,
        message: '所有字段都是必填的'
      });
      return;
    }

    // 验证角色
    if (!['owner', 'bartender'].includes(role)) {
      res.status(400).json({
        success: false,
        message: '无效的用户角色'
      });
      return;
    }

    // 检查用户名是否已存在
    const existingUser = await User.findOne({ where: { username } });
    if (existingUser) {
      res.status(400).json({
        success: false,
        message: '用户名已存在'
      });
      return;
    }

    // 加密密码
    const hashedPassword = await User.hashPassword(password);

    // 创建用户
    const newUser = await User.create({
      username,
      password_hash: hashedPassword,
      name,
      role
    });

    res.status(201).json({
      success: true,
      message: '用户创建成功',
      user: {
        id: newUser.id,
        username: newUser.username,
        name: newUser.name,
        role: newUser.role
      }
    });
  } catch (error) {
    console.error('创建用户错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 获取所有用户（仅店长权限）
export const getUsers = async (req: Request, res: Response): Promise<void> => {
  try {
    const users = await User.findAll({
      attributes: ['id', 'username', 'name', 'role', 'is_active', 'created_at'],
      order: [['created_at', 'DESC']]
    });

    res.json({
      success: true,
      users
    });
  } catch (error) {
    console.error('获取用户列表错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};

// 更新用户状态（仅店长权限）
export const updateUserStatus = async (req: Request, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { is_active } = req.body;

    if (typeof is_active !== 'boolean') {
      res.status(400).json({
        success: false,
        message: '无效的状态值'
      });
      return;
    }

    const user = await User.findByPk(id);
    if (!user) {
      res.status(404).json({
        success: false,
        message: '用户不存在'
      });
      return;
    }

    // 不能禁用自己
    if (user.id === req.user?.id && !is_active) {
      res.status(400).json({
        success: false,
        message: '不能禁用自己的账号'
      });
      return;
    }

    await user.update({ is_active });

    res.json({
      success: true,
      message: `用户已${is_active ? '启用' : '禁用'}`,
      user: {
        id: user.id,
        username: user.username,
        name: user.name,
        role: user.role,
        is_active: user.is_active
      }
    });
  } catch (error) {
    console.error('更新用户状态错误:', error);
    res.status(500).json({
      success: false,
      message: '服务器内部错误'
    });
  }
};