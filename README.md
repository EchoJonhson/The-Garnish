# The Garnish - 为真正的调酒艺术家打造的管理系统

*这不只是软件，这是一份宣言。*

我们坚信，酒吧的灵魂在于精湛的技艺、独特的氛围，以及在精心调制的饮品旁分享的故事，而非冰冷的电子表格。"The Garnish" 旨在成为您沉默的伙伴，为您处理繁琐的事务，让您能专注于创造魔法。它如同画龙点睛的最后一道装饰，完美衬托您的艺术，却从不喧宾夺主。

我们为艺术家、为主人、为创造者而构建。如果您对自己的事业充满热忱，那么这里就是您的归宿。

**为匠人，而非会计师。**

---

## 🌟 核心功能

"The Garnish" 是一个轻量级但功能强大的酒吧管理系统，专为满足现代小酒馆的核心需求而设计。

- **🍹 配方管理**: 标准化您的鸡尾酒配方，自动计算成本与利润，并支持动态调整。
- **📋 订单处理**: 直观的点单界面，支持基酒替换和实时价格更新，确保每一单都准确无误。
- **📦 库存跟踪**: 实时监控原料库存，提供智能预警，让您告别断货烦恼。
- **📊 销售分析**: 提供清晰的销售报表和利润分析，助您洞察经营状况，做出更明智的决策。

## 🛠️ 技术栈

我们采用现代化的技术栈，以确保系统的性能、稳定性和可扩展性。

- **前端**: React, TypeScript, Vite, Tailwind CSS
- **后端**: Node.js, Express
- **数据库**: SQLite

## 🚀 快速启动

### 系统要求

- **Node.js**: >= 18.0.0 (推荐使用 LTS 版本)
- **npm**: >= 9.0.0
- **可用端口**: 3001 (后端), 5173 (前端)

### 一键启动 (推荐)

我们提供了一键启动脚本，它将自动完成所有准备工作。

```bash
npm run start
```

此命令将自动执行以下操作：
- ✅ 检查您的系统环境。
- ✅ 安装所有前后端依赖。
- ✅ 初始化 SQLite 数据库。
- ✅ 同时启动后端和前端服务。
- ✅ 在控制台显示访问地址。

### 开发者启动

如果您希望分别控制前端和后端服务，以便于调试：

```bash
# 终端 1: 启动后端服务
cd backend
npm install
npm run dev

# 终端 2: 启动前端服务
cd frontend
npm install
npm run dev
```

### 访问入口

- **前端用户界面**: [http://localhost:5173](http://localhost:5173)
- **后端 API 服务**: [http://localhost:3001](http://localhost:3001)
- **默认登录凭证**: `admin` / `admin123`

---

## 📁 项目结构

```
.
├── backend/         # 后端 (Express.js)
│   ├── src/
│   └── ...
├── frontend/        # 前端 (React)
│   ├── src/
│   └── ...
├── scripts/         # 自动化脚本
└── ...
```

更详细的技术架构、API 定义和数据模型，请参阅内部技术文档。

## 🛡️ 安全策略 (Security Policy)

我们严肃对待安全问题。

### 报告漏洞

如果您发现任何安全漏洞，请**不要**在公开的 GitHub Issues 中报告。我们将创建 `SECURITY.md` 文件来详细说明漏洞上报流程，并建议您通过其中指定的安全渠道联系我们。

### ⚠️ 重要安全提示

- **默认凭证**: 本项目包含用于快速演示的默认管理员凭证 (`admin` / `admin123`)。**在任何非本地开发环境中使用这些凭证都是极其危险的。** 我们强烈建议您在首次启动后立即修改密码。
- **环境变量**: 请务必将 `.env.example` 复制为 `.env` 并填写安全的密钥，尤其是 `JWT_SECRET`。不要将 `.env` 文件提交到版本控制中。

## 🧪 测试

我们使用 Jest 进行后端API测试，确保系统的可靠性和稳定性。

### 运行测试

```bash
# 运行所有测试
npm test

# 监视模式运行测试（开发时推荐）
npm run test:watch

# 运行测试并生成覆盖率报告
npm run test:coverage
```

### 测试类型

- **单元测试**: 测试单个API端点的功能
- **集成测试**: 测试完整的用户流程（登录、token验证等）

### 重要提示

⚠️ **集成测试需要后端服务运行**: 在运行集成测试前，请确保后端服务已启动：

```bash
# 在另一个终端中启动后端服务
npm run backend:dev
# 或使用一键启动
npm run start
```

测试文件位于 `tests/` 目录下，遵循 Jest 的标准命名约定（`*.test.js`）。

在提交任何代码前，请确保所有测试都已通过。

## ☁️ 部署

有关如何将此应用部署到生产环境的详细说明，请参阅 <mcfile name="deployment_guide.md" path="/Users/guopeiran/Code/VSCode/drink/.trae/documents/deployment_guide.md"></mcfile>。

## 🤝 贡献指南

我们欢迎任何形式的贡献！无论是报告 bug、提交新功能还是改进文档。我们将创建 `CONTRIBUTING.md` 文件来详细说明我们的开发流程、编码规范和 Pull Request 指南。

## 📄 许可证

本项目将采用 MIT 许可证。我们将很快在项目根目录添加 `LICENSE` 文件。

## 🔍 故障排查

我们整理了一份详细的故障排查指南，请见 <mcfile name="TROUBLESHOOTING.md" path="/Users/guopeiran/Code/VSCode/drink/TROUBLESHOOTING.md"></mcfile>。以下是一些常见问题的快速解决方案：

- **页面空白或报错?**
    1.  **强制刷新**: `Ctrl + F5` 或 `Cmd + Shift + R`。
    2.  **检查控制台**: 打开浏览器开发者工具 (F12)，查看 Console 面板中的错误信息。
    3.  **重启服务**: 在终端按 `Ctrl + C` 停止服务，然后重新运行 `npm run start`。

- **端口被占用?**
    ```bash
    # 查找占用指定端口的进程 (例如 5173)
    lsof -i :5173
    # 终止该进程
    kill -9 <PID>
    ```

- **依赖安装失败?**
    ```bash
    # 清理缓存并重新安装
    npm cache clean --force
    rm -rf node_modules package-lock.json
    npm install
    ```

---

**尽情享用 The Garnish! 🍹**