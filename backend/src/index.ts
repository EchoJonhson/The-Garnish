import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import { initDatabase, seedDatabase } from './models';
import authRoutes from './routes/auth';

// 加载环境变量
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// 中间件配置
app.use(helmet()); // 安全头
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true
})); // CORS配置
app.use(express.json({ limit: '10mb' })); // JSON解析
app.use(express.urlencoded({ extended: true, limit: '10mb' })); // URL编码解析

// 请求日志中间件
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});

// 健康检查端点
app.get('/health', (req, res) => {
  res.json({
    success: true,
    message: '调酒师酒吧管理系统后端服务运行正常',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API路由
app.use('/api/auth', authRoutes);

// 404处理
app.use('*', (req, res) => {
  res.status(404).json({
    success: false,
    message: '接口不存在'
  });
});

// 全局错误处理中间件
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  console.error('全局错误:', err);
  res.status(500).json({
    success: false,
    message: '服务器内部错误',
    ...(process.env.NODE_ENV === 'development' && { error: err.message })
  });
});

// 启动服务器
const startServer = async () => {
  try {
    // 初始化数据库
    await initDatabase();
    console.log('数据库初始化完成');

    // 创建种子数据
    await seedDatabase();
    console.log('种子数据初始化完成');

    // 启动HTTP服务器
    app.listen(PORT, () => {
      console.log(`🚀 调酒师酒吧管理系统后端服务启动成功`);
      console.log(`📍 服务地址: http://localhost:${PORT}`);
      console.log(`🌍 环境: ${process.env.NODE_ENV || 'development'}`);
      console.log(`📊 健康检查: http://localhost:${PORT}/health`);
    });
  } catch (error) {
    console.error('服务器启动失败:', error);
    process.exit(1);
  }
};

// 优雅关闭处理
process.on('SIGTERM', () => {
  console.log('收到SIGTERM信号，正在优雅关闭服务器...');
  process.exit(0);
});

process.on('SIGINT', () => {
  console.log('收到SIGINT信号，正在优雅关闭服务器...');
  process.exit(0);
});

// 启动服务器
startServer();

export default app;