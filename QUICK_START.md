# 🚀 调酒师酒吧管理系统 - 一键启动指南

## 快速开始

### 一键启动（推荐）

```bash
npm run start
```

这个命令会自动完成以下操作：
- ✅ 检查系统环境（Node.js、npm版本等）
- ✅ 安装所有依赖（前端、后端）
- ✅ 初始化数据库
- ✅ 启动后端服务（端口：3001）
- ✅ 启动前端服务（端口：5173）
- ✅ 执行健康检查
- ✅ 显示访问地址

### 系统要求

- **Node.js**: >= 18.0.0（推荐 22.x LTS）
- **npm**: >= 9.0.0
- **可用端口**: 3001（后端）、5173（前端）
- **内存**: >= 1GB
- **磁盘空间**: >= 200MB

## 其他命令

### 环境检查

```bash
npm run check-env
```

在启动系统前检查环境是否满足要求。

### 服务管理

```bash
# 启动所有服务
npm run services:start

# 停止所有服务
npm run services:stop

# 重启所有服务
npm run services:restart

# 查看服务状态
npm run services:status

# 健康检查
npm run services:health
```

### 单独操作

```bash
# 安装所有依赖
npm run install:all

# 只启动前端
npm run frontend:dev

# 只启动后端
npm run backend:dev

# 构建前端
npm run frontend:build

# 构建后端
npm run backend:build

# 清理并重新安装
npm run clean:install
```

## 访问地址

启动成功后，可以通过以下地址访问系统：

- **前端界面**: http://localhost:5173
- **后端API**: http://localhost:3001
- **默认账号**: admin / admin123

## 常见问题

### 1. 端口被占用

如果遇到端口占用问题，可以：

```bash
# 查看端口占用情况
lsof -i :3001
lsof -i :5173

# 杀死占用端口的进程
kill -9 <PID>
```

### 2. 依赖安装失败

```bash
# 清理缓存并重新安装
npm cache clean --force
npm run clean:install
```

### 3. 数据库问题

```bash
# 删除数据库文件重新初始化
rm backend/database.sqlite
npm run start
```

### 4. Node.js版本过低

```bash
# 使用nvm升级Node.js
nvm install 20
nvm use 20
```

## 停止服务

在启动的终端中按 `Ctrl+C` 即可停止所有服务。

或者使用命令：

```bash
npm run services:stop
```

## 开发模式

如果你是开发者，可以分别启动前后端服务进行开发：

```bash
# 终端1：启动后端
cd backend
npm run dev

# 终端2：启动前端
cd frontend
npm run dev
```

## 生产部署

生产环境部署请参考 `deployment_guide.md` 文档。

## 技术支持

如果遇到问题，请：

1. 首先运行环境检查：`npm run check-env`
2. 查看服务状态：`npm run services:status`
3. 执行健康检查：`npm run services:health`
4. 查看详细的技术文档：`technical_documentation.md`
5. 查看用户手册：`user_manual.md`

---

**享受使用调酒师酒吧管理系统！🍹**