# 调酒师酒吧管理系统生产部署指南

## 1. 环境要求和依赖安装

### 1.1 系统要求

#### 最低配置要求
- **操作系统**：Ubuntu 20.04 LTS / CentOS 8 / macOS 10.15+
- **CPU**：1核心 2.0GHz
- **内存**：2GB RAM
- **存储**：10GB 可用空间
- **网络**：稳定的互联网连接

#### 推荐配置
- **操作系统**：Ubuntu 22.04 LTS
- **CPU**：2核心 2.4GHz
- **内存**：4GB RAM
- **存储**：20GB SSD
- **网络**：100Mbps 带宽

### 1.2 软件依赖

#### Node.js 环境
```bash
# 安装 Node.js 22.x LTS（推荐）
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt-get install -y nodejs

# 或者安装 Node.js 18.x LTS（最低要求）
# curl -fsSL https://deb.nodesource.com/setup_18.x | sudo -E bash -
# sudo apt-get install -y nodejs

# 验证安装
node --version  # 应显示 v22.x.x 或 v18.x.x
npm --version   # 应显示 10.x.x 或更高版本
```

#### PM2 进程管理器
```bash
# 全局安装 PM2
npm install -g pm2

# 验证安装
pm2 --version
```

#### Nginx 反向代理（可选）
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install nginx

# CentOS/RHEL
sudo yum install nginx

# 启动并设置开机自启
sudo systemctl start nginx
sudo systemctl enable nginx
```

#### 防火墙配置
```bash
# Ubuntu UFW
sudo ufw allow 22      # SSH
sudo ufw allow 80      # HTTP
sudo ufw allow 443     # HTTPS
sudo ufw allow 3001    # API端口（如果直接暴露）
sudo ufw enable

# CentOS firewalld
sudo firewall-cmd --permanent --add-port=22/tcp
sudo firewall-cmd --permanent --add-port=80/tcp
sudo firewall-cmd --permanent --add-port=443/tcp
sudo firewall-cmd --permanent --add-port=3001/tcp
sudo firewall-cmd --reload
```

## 2. 数据库配置和初始化

### 2.1 SQLite 数据库设置

#### 创建数据目录
```bash
# 创建应用目录结构
sudo mkdir -p /opt/bar-management
sudo mkdir -p /opt/bar-management/data
sudo mkdir -p /opt/bar-management/logs
sudo mkdir -p /opt/bar-management/backups

# 设置权限
sudo chown -R $USER:$USER /opt/bar-management
chmod 755 /opt/bar-management
chmod 755 /opt/bar-management/data
chmod 755 /opt/bar-management/logs
chmod 755 /opt/bar-management/backups
```

#### 数据库初始化脚本
```bash
#!/bin/bash
# init-database.sh

set -e

DB_PATH="/opt/bar-management/data/production.sqlite"
BACKUP_PATH="/opt/bar-management/backups"

echo "初始化数据库..."

# 如果数据库已存在，创建备份
if [ -f "$DB_PATH" ]; then
    echo "发现现有数据库，创建备份..."
    cp "$DB_PATH" "$BACKUP_PATH/backup_$(date +%Y%m%d_%H%M%S).sqlite"
fi

# 运行数据库迁移
cd /opt/bar-management/backend
npm run migrate

# 初始化基础数据
npm run seed

echo "数据库初始化完成"
```

### 2.2 数据库迁移

#### 迁移脚本示例
```sql
-- migrations/001_initial_schema.sql
-- 创建用户表
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username VARCHAR(50) UNIQUE NOT NULL,
    password_hash VARCHAR(255) NOT NULL,
    name VARCHAR(100) NOT NULL,
    role VARCHAR(20) NOT NULL CHECK (role IN ('owner', 'bartender')),
    is_active BOOLEAN DEFAULT 1,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建产品表
CREATE TABLE IF NOT EXISTS products (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name VARCHAR(200) NOT NULL,
    brand VARCHAR(100),
    category VARCHAR(50) NOT NULL,
    size_ml DECIMAL(10,2) NOT NULL,
    unit_cost_per_ml DECIMAL(10,4) NOT NULL,
    current_stock_ml DECIMAL(10,2) DEFAULT 0,
    warning_level DECIMAL(10,2) DEFAULT 0,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- 创建索引
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);
CREATE INDEX IF NOT EXISTS idx_products_category ON products(category);
CREATE INDEX IF NOT EXISTS idx_products_stock_level ON products(current_stock_ml);
```

#### 种子数据脚本
```sql
-- seeds/001_default_data.sql
-- 插入默认管理员用户
INSERT OR IGNORE INTO users (username, password_hash, name, role) VALUES 
('admin', '$2b$10$encrypted_password_hash', '系统管理员', 'owner');

-- 插入基础产品数据
INSERT OR IGNORE INTO products (name, brand, category, size_ml, unit_cost_per_ml, warning_level) VALUES 
('威士忌', 'Jack Daniels', '基酒', 750.00, 0.08, 1500.00),
('伏特加', 'Absolut', '基酒', 750.00, 0.06, 1500.00),
('朗姆酒', 'Bacardi', '基酒', 750.00, 0.07, 1500.00),
('金酒', 'Bombay', '基酒', 750.00, 0.09, 1500.00),
('柠檬汁', '鲜榨', '辅料', 1000.00, 0.01, 500.00),
('糖浆', '自制', '辅料', 500.00, 0.005, 250.00);
```

## 3. 应用配置和环境变量

### 3.1 环境变量配置

#### 生产环境配置文件
```bash
# /opt/bar-management/backend/.env.production
NODE_ENV=production
PORT=3001

# JWT配置
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=24h

# 数据库配置
DB_PATH=/opt/bar-management/data/production.sqlite
DB_BACKUP_PATH=/opt/bar-management/backups

# CORS配置
CORS_ORIGIN=https://yourdomain.com
CORS_CREDENTIALS=true

# 日志配置
LOG_LEVEL=info
LOG_FILE=/opt/bar-management/logs/app.log
ERROR_LOG_FILE=/opt/bar-management/logs/error.log

# 安全配置
BCRYPT_ROUNDS=12
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100

# 文件上传配置
UPLOAD_MAX_SIZE=5242880
UPLOAD_PATH=/opt/bar-management/uploads
```

#### 前端环境配置
```bash
# /opt/bar-management/frontend/.env.production
VITE_API_BASE_URL=https://api.yourdomain.com
VITE_APP_NAME=调酒师酒吧管理系统
VITE_APP_VERSION=1.0.0
```

### 3.2 安全配置

#### JWT密钥生成
```bash
# 生成安全的JWT密钥
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

#### 文件权限设置
```bash
# 设置配置文件权限
chmod 600 /opt/bar-management/backend/.env.production
chmod 600 /opt/bar-management/frontend/.env.production

# 设置应用文件权限
chmod -R 755 /opt/bar-management
chmod -R 644 /opt/bar-management/backend/dist
chmod -R 644 /opt/bar-management/frontend/dist
```

## 4. 部署流程和步骤

### 4.1 自动化部署脚本

#### 主部署脚本
```bash
#!/bin/bash
# deploy.sh

set -e

# 配置变量
APP_DIR="/opt/bar-management"
REPO_URL="https://github.com/yourusername/bar-management.git"
BRANCH="main"
BACKUP_DIR="$APP_DIR/backups"

echo "开始部署调酒师酒吧管理系统..."

# 创建备份
echo "创建当前版本备份..."
if [ -d "$APP_DIR/current" ]; then
    cp -r "$APP_DIR/current" "$BACKUP_DIR/backup_$(date +%Y%m%d_%H%M%S)"
fi

# 克隆或更新代码
echo "获取最新代码..."
if [ -d "$APP_DIR/source" ]; then
    cd "$APP_DIR/source"
    git pull origin $BRANCH
else
    git clone -b $BRANCH $REPO_URL "$APP_DIR/source"
fi

# 构建后端
echo "构建后端应用..."
cd "$APP_DIR/source/backend"
npm ci --production
npm run build

# 构建前端
echo "构建前端应用..."
cd "$APP_DIR/source/frontend"
npm ci
npm run build

# 部署应用
echo "部署应用文件..."
rm -rf "$APP_DIR/current"
mkdir -p "$APP_DIR/current"

# 复制后端文件
cp -r "$APP_DIR/source/backend/dist" "$APP_DIR/current/backend"
cp -r "$APP_DIR/source/backend/node_modules" "$APP_DIR/current/backend/"
cp "$APP_DIR/source/backend/package.json" "$APP_DIR/current/backend/"
cp "$APP_DIR/source/backend/.env.production" "$APP_DIR/current/backend/.env"

# 复制前端文件
cp -r "$APP_DIR/source/frontend/dist" "$APP_DIR/current/frontend"

# 运行数据库迁移
echo "运行数据库迁移..."
cd "$APP_DIR/current/backend"
NODE_ENV=production npm run migrate

# 重启服务
echo "重启应用服务..."
pm2 reload bar-management-api

# 重启Nginx
echo "重启Nginx..."
sudo systemctl reload nginx

echo "部署完成！"
```

### 4.2 PM2 配置

#### PM2 生态系统文件
```json
{
  "apps": [
    {
      "name": "bar-management-api",
      "script": "/opt/bar-management/current/backend/dist/server.js",
      "cwd": "/opt/bar-management/current/backend",
      "instances": 1,
      "exec_mode": "cluster",
      "env": {
        "NODE_ENV": "production",
        "PORT": 3001
      },
      "log_file": "/opt/bar-management/logs/pm2.log",
      "error_file": "/opt/bar-management/logs/pm2-error.log",
      "out_file": "/opt/bar-management/logs/pm2-out.log",
      "log_date_format": "YYYY-MM-DD HH:mm:ss",
      "merge_logs": true,
      "max_memory_restart": "500M",
      "restart_delay": 4000,
      "max_restarts": 10,
      "min_uptime": "10s",
      "kill_timeout": 5000,
      "wait_ready": true,
      "listen_timeout": 10000
    }
  ]
}
```

#### PM2 启动脚本
```bash
#!/bin/bash
# start-services.sh

set -e

echo "启动应用服务..."

# 启动PM2应用
cd /opt/bar-management
pm2 start ecosystem.config.json

# 保存PM2配置
pm2 save

# 设置PM2开机自启
pm2 startup

echo "服务启动完成"
echo "查看服务状态：pm2 status"
echo "查看日志：pm2 logs bar-management-api"
```

### 4.3 Nginx 配置

#### Nginx 站点配置
```nginx
# /etc/nginx/sites-available/bar-management
server {
    listen 80;
    server_name yourdomain.com www.yourdomain.com;
    
    # 重定向到HTTPS
    return 301 https://$server_name$request_uri;
}

server {
    listen 443 ssl http2;
    server_name yourdomain.com www.yourdomain.com;
    
    # SSL配置
    ssl_certificate /etc/ssl/certs/yourdomain.com.crt;
    ssl_certificate_key /etc/ssl/private/yourdomain.com.key;
    ssl_protocols TLSv1.2 TLSv1.3;
    ssl_ciphers ECDHE-RSA-AES256-GCM-SHA512:DHE-RSA-AES256-GCM-SHA512:ECDHE-RSA-AES256-GCM-SHA384:DHE-RSA-AES256-GCM-SHA384;
    ssl_prefer_server_ciphers off;
    ssl_session_cache shared:SSL:10m;
    ssl_session_timeout 10m;
    
    # 安全头
    add_header X-Frame-Options DENY;
    add_header X-Content-Type-Options nosniff;
    add_header X-XSS-Protection "1; mode=block";
    add_header Strict-Transport-Security "max-age=31536000; includeSubDomains" always;
    
    # 前端静态文件
    location / {
        root /opt/bar-management/current/frontend;
        try_files $uri $uri/ /index.html;
        
        # 缓存配置
        location ~* \.(js|css|png|jpg|jpeg|gif|ico|svg)$ {
            expires 1y;
            add_header Cache-Control "public, immutable";
        }
    }
    
    # API代理
    location /api/ {
        proxy_pass http://127.0.0.1:3001;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
        
        # 超时配置
        proxy_connect_timeout 30s;
        proxy_send_timeout 30s;
        proxy_read_timeout 30s;
    }
    
    # 健康检查
    location /health {
        proxy_pass http://127.0.0.1:3001/health;
        access_log off;
    }
    
    # 日志配置
    access_log /var/log/nginx/bar-management.access.log;
    error_log /var/log/nginx/bar-management.error.log;
}
```

#### 启用站点
```bash
# 创建软链接
sudo ln -s /etc/nginx/sites-available/bar-management /etc/nginx/sites-enabled/

# 测试配置
sudo nginx -t

# 重启Nginx
sudo systemctl restart nginx
```

## 5. 服务启动和管理

### 5.1 系统服务配置

#### Systemd 服务文件
```ini
# /etc/systemd/system/bar-management.service
[Unit]
Description=Bar Management System
After=network.target

[Service]
Type=forking
User=barmanager
WorkingDirectory=/opt/bar-management
ExecStart=/usr/bin/pm2 start ecosystem.config.json --no-daemon
ExecReload=/usr/bin/pm2 reload all
ExecStop=/usr/bin/pm2 kill
Restart=always
RestartSec=10

[Install]
WantedBy=multi-user.target
```

#### 服务管理命令
```bash
# 启用服务
sudo systemctl enable bar-management

# 启动服务
sudo systemctl start bar-management

# 查看服务状态
sudo systemctl status bar-management

# 重启服务
sudo systemctl restart bar-management

# 停止服务
sudo systemctl stop bar-management

# 查看服务日志
sudo journalctl -u bar-management -f
```

### 5.2 健康检查

#### 健康检查端点
```typescript
// backend/src/routes/health.ts
import { Router } from 'express';
import { sequelize } from '../database';

const router = Router();

router.get('/health', async (req, res) => {
  try {
    // 检查数据库连接
    await sequelize.authenticate();
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      memory: process.memoryUsage(),
      database: 'connected',
      version: process.env.npm_package_version || '1.0.0'
    };
    
    res.status(200).json(healthStatus);
  } catch (error) {
    res.status(503).json({
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error.message
    });
  }
});

export default router;
```

#### 监控脚本
```bash
#!/bin/bash
# health-check.sh

API_URL="http://localhost:3001/health"
MAX_RETRIES=3
RETRY_DELAY=5

for i in $(seq 1 $MAX_RETRIES); do
    if curl -f -s $API_URL > /dev/null; then
        echo "健康检查通过"
        exit 0
    else
        echo "健康检查失败，重试 $i/$MAX_RETRIES"
        sleep $RETRY_DELAY
    fi
done

echo "健康检查失败，重启服务"
pm2 restart bar-management-api
```

## 6. 监控和日志配置

### 6.1 日志管理

#### 日志轮转配置
```bash
# /etc/logrotate.d/bar-management
/opt/bar-management/logs/*.log {
    daily
    missingok
    rotate 30
    compress
    delaycompress
    notifempty
    create 644 barmanager barmanager
    postrotate
        pm2 reloadLogs
    endscript
}
```

#### 应用日志配置
```typescript
// backend/src/utils/logger.ts
import winston from 'winston';
import path from 'path';

const logDir = process.env.LOG_DIR || './logs';

const logger = winston.createLogger({
  level: process.env.LOG_LEVEL || 'info',
  format: winston.format.combine(
    winston.format.timestamp({
      format: 'YYYY-MM-DD HH:mm:ss'
    }),
    winston.format.errors({ stack: true }),
    winston.format.json()
  ),
  defaultMeta: { service: 'bar-management-api' },
  transports: [
    new winston.transports.File({
      filename: path.join(logDir, 'error.log'),
      level: 'error',
      maxsize: 5242880, // 5MB
      maxFiles: 10
    }),
    new winston.transports.File({
      filename: path.join(logDir, 'combined.log'),
      maxsize: 5242880, // 5MB
      maxFiles: 10
    })
  ]
});

if (process.env.NODE_ENV !== 'production') {
  logger.add(new winston.transports.Console({
    format: winston.format.combine(
      winston.format.colorize(),
      winston.format.simple()
    )
  }));
}

export default logger;
```

### 6.2 性能监控

#### PM2 监控
```bash
# 安装PM2监控模块
pm2 install pm2-server-monit

# 查看实时监控
pm2 monit

# 查看进程状态
pm2 status

# 查看资源使用情况
pm2 show bar-management-api
```

#### 系统监控脚本
```bash
#!/bin/bash
# system-monitor.sh

LOG_FILE="/opt/bar-management/logs/system-monitor.log"
TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')

# 获取系统信息
CPU_USAGE=$(top -bn1 | grep "Cpu(s)" | awk '{print $2}' | awk -F'%' '{print $1}')
MEMORY_USAGE=$(free | grep Mem | awk '{printf "%.2f", $3/$2 * 100.0}')
DISK_USAGE=$(df -h /opt/bar-management | awk 'NR==2 {print $5}' | sed 's/%//')

# 记录监控数据
echo "$TIMESTAMP - CPU: ${CPU_USAGE}%, Memory: ${MEMORY_USAGE}%, Disk: ${DISK_USAGE}%" >> $LOG_FILE

# 检查阈值并发送告警
if (( $(echo "$CPU_USAGE > 80" | bc -l) )); then
    echo "$TIMESTAMP - WARNING: High CPU usage: ${CPU_USAGE}%" >> $LOG_FILE
fi

if (( $(echo "$MEMORY_USAGE > 80" | bc -l) )); then
    echo "$TIMESTAMP - WARNING: High memory usage: ${MEMORY_USAGE}%" >> $LOG_FILE
fi

if [ "$DISK_USAGE" -gt 80 ]; then
    echo "$TIMESTAMP - WARNING: High disk usage: ${DISK_USAGE}%" >> $LOG_FILE
fi
```

#### 定时监控任务
```bash
# 添加到crontab
crontab -e

# 每5分钟执行一次系统监控
*/5 * * * * /opt/bar-management/scripts/system-monitor.sh

# 每小时执行一次健康检查
0 * * * * /opt/bar-management/scripts/health-check.sh

# 每天凌晨2点执行数据库备份
0 2 * * * /opt/bar-management/scripts/backup-database.sh
```

## 7. 备份和恢复策略

### 7.1 数据库备份

#### 自动备份脚本
```bash
#!/bin/bash
# backup-database.sh

set -e

BACKUP_DIR="/opt/bar-management/backups"
DB_PATH="/opt/bar-management/data/production.sqlite"
TIMESTAMP=$(date +%Y%m%d_%H%M%S)
BACKUP_FILE="$BACKUP_DIR/db_backup_$TIMESTAMP.sqlite"
LOG_FILE="/opt/bar-management/logs/backup.log"

echo "$(date): 开始数据库备份" >> $LOG_FILE

# 创建备份目录
mkdir -p $BACKUP_DIR

# 复制数据库文件
cp "$DB_PATH" "$BACKUP_FILE"

# 压缩备份文件
gzip "$BACKUP_FILE"

# 删除7天前的备份
find $BACKUP_DIR -name "db_backup_*.sqlite.gz" -mtime +7 -delete

echo "$(date): 数据库备份完成: ${BACKUP_FILE}.gz" >> $LOG_FILE

# 验证备份文件
if [ -f "${BACKUP_FILE}.gz" ]; then
    echo "$(date): 备份验证成功" >> $LOG_FILE
else
    echo "$(date): 备份验证失败" >> $LOG_FILE
    exit 1
fi
```

#### 远程备份脚本
```bash
#!/bin/bash
# remote-backup.sh

set -e

LOCAL_BACKUP_DIR="/opt/bar-management/backups"
REMOTE_HOST="backup.yourdomain.com"
REMOTE_USER="backup"
REMOTE_DIR="/backups/bar-management"
LOG_FILE="/opt/bar-management/logs/remote-backup.log"

echo "$(date): 开始远程备份同步" >> $LOG_FILE

# 同步备份文件到远程服务器
rsync -avz --delete \
    --include="*.gz" \
    --exclude="*" \
    "$LOCAL_BACKUP_DIR/" \
    "$REMOTE_USER@$REMOTE_HOST:$REMOTE_DIR/"

if [ $? -eq 0 ]; then
    echo "$(date): 远程备份同步成功" >> $LOG_FILE
else
    echo "$(date): 远程备份同步失败" >> $LOG_FILE
    exit 1
fi
```

### 7.2 数据恢复

#### 数据库恢复脚本
```bash
#!/bin/bash
# restore-database.sh

set -e

if [ $# -ne 1 ]; then
    echo "用法: $0 <backup_file>"
    echo "示例: $0 /opt/bar-management/backups/db_backup_20240101_120000.sqlite.gz"
    exit 1
fi

BACKUP_FILE="$1"
DB_PATH="/opt/bar-management/data/production.sqlite"
LOG_FILE="/opt/bar-management/logs/restore.log"

echo "$(date): 开始数据库恢复" >> $LOG_FILE

# 检查备份文件是否存在
if [ ! -f "$BACKUP_FILE" ]; then
    echo "错误: 备份文件不存在: $BACKUP_FILE"
    exit 1
fi

# 停止应用服务
echo "停止应用服务..."
pm2 stop bar-management-api

# 备份当前数据库
echo "备份当前数据库..."
cp "$DB_PATH" "${DB_PATH}.restore_backup_$(date +%Y%m%d_%H%M%S)"

# 恢复数据库
echo "恢复数据库..."
if [[ "$BACKUP_FILE" == *.gz ]]; then
    gunzip -c "$BACKUP_FILE" > "$DB_PATH"
else
    cp "$BACKUP_FILE" "$DB_PATH"
fi

# 设置文件权限
chown barmanager:barmanager "$DB_PATH"
chmod 644 "$DB_PATH"

# 启动应用服务
echo "启动应用服务..."
pm2 start bar-management-api

# 等待服务启动
sleep 10

# 验证恢复
if curl -f -s http://localhost:3001/health > /dev/null; then
    echo "$(date): 数据库恢复成功" >> $LOG_FILE
    echo "数据库恢复成功"
else
    echo "$(date): 数据库恢复失败，服务无法启动" >> $LOG_FILE
    echo "错误: 数据库恢复失败，服务无法启动"
    exit 1
fi
```

## 8. 故障排查指南

### 8.1 常见问题诊断

#### 服务无法启动
```bash
# 检查服务状态
pm2 status
sudo systemctl status bar-management

# 查看错误日志
pm2 logs bar-management-api --err
tail -f /opt/bar-management/logs/error.log

# 检查端口占用
sudo netstat -tlnp | grep :3001
sudo lsof -i :3001

# 检查文件权限
ls -la /opt/bar-management/current/backend/
ls -la /opt/bar-management/data/
```

#### 数据库连接问题
```bash
# 检查数据库文件
ls -la /opt/bar-management/data/production.sqlite

# 测试数据库连接
sqlite3 /opt/bar-management/data/production.sqlite ".tables"

# 检查数据库权限
ls -la /opt/bar-management/data/
```

#### 内存不足问题
```bash
# 检查内存使用
free -h
top -p $(pgrep -f "bar-management")

# 检查PM2进程
pm2 show bar-management-api

# 重启服务释放内存
pm2 restart bar-management-api
```

### 8.2 日志分析

#### 错误日志分析脚本
```bash
#!/bin/bash
# analyze-logs.sh

LOG_FILE="/opt/bar-management/logs/error.log"
OUTPUT_FILE="/tmp/error-analysis.txt"

echo "错误日志分析报告 - $(date)" > $OUTPUT_FILE
echo "========================================" >> $OUTPUT_FILE

# 统计错误类型
echo "错误类型统计:" >> $OUTPUT_FILE
grep -o '"level":"error"' $LOG_FILE | wc -l | xargs echo "总错误数:" >> $OUTPUT_FILE
grep -o '"message":"[^"]*"' $LOG_FILE | sort | uniq -c | sort -nr | head -10 >> $OUTPUT_FILE

echo "" >> $OUTPUT_FILE
echo "最近的错误:" >> $OUTPUT_FILE
tail -20 $LOG_FILE >> $OUTPUT_FILE

cat $OUTPUT_FILE
```

### 8.3 性能问题排查

#### 性能分析脚本
```bash
#!/bin/bash
# performance-check.sh

echo "性能检查报告 - $(date)"
echo "=============================="

# CPU使用率
echo "CPU使用率:"
top -bn1 | grep "Cpu(s)" | awk '{print $2}'

# 内存使用情况
echo "内存使用情况:"
free -h

# 磁盘使用情况
echo "磁盘使用情况:"
df -h /opt/bar-management

# 进程信息
echo "应用进程信息:"
pm2 show bar-management-api

# 网络连接
echo "网络连接数:"
ss -tuln | grep :3001

# 数据库大小
echo "数据库大小:"
ls -lh /opt/bar-management/data/production.sqlite
```

## 9. 性能调优建议

### 9.1 应用层优化

#### Node.js 性能配置
```bash
# 设置Node.js环境变量
export NODE_OPTIONS="--max-old-space-size=512"
export UV_THREADPOOL_SIZE=4
```

#### PM2 优化配置
```json
{
  "apps": [{
    "name": "bar-management-api",
    "script": "dist/server.js",
    "instances": "max",
    "exec_mode": "cluster",
    "max_memory_restart": "400M",
    "node_args": "--max-old-space-size=512",
    "env": {
      "NODE_ENV": "production",
      "UV_THREADPOOL_SIZE": 4
    }
  }]
}
```

### 9.2 数据库优化

#### SQLite 性能配置
```sql
-- 优化SQLite设置
PRAGMA journal_mode = WAL;
PRAGMA synchronous = NORMAL;
PRAGMA cache_size = 1000;
PRAGMA temp_store = memory;
PRAGMA mmap_size = 268435456; -- 256MB
```

#### 查询优化
```typescript
// 使用索引优化查询
const recipes = await Recipe.findAll({
  include: [{
    model: RecipeLine,
    include: [Product]
  }],
  order: [['created_at', 'DESC']],
  limit: 20,
  offset: (page - 1) * 20
});

// 使用原生查询优化复杂查询
const salesReport = await sequelize.query(`
  SELECT 
    r.name,
    SUM(ol.quantity) as total_sold,
    SUM(ol.quantity * ol.unit_price) as total_revenue
  FROM recipes r
  JOIN order_lines ol ON r.id = ol.recipe_id
  JOIN orders o ON ol.order_id = o.id
  WHERE o.created_at >= :start_date
    AND o.created_at <= :end_date
  GROUP BY r.id, r.name
  ORDER BY total_revenue DESC
`, {
  replacements: { start_date, end_date },
  type: QueryTypes.SELECT
});
```

### 9.3 系统级优化

#### 文件描述符限制
```bash
# 增加文件描述符限制
echo "* soft nofile 65536" >> /etc/security/limits.conf
echo "* hard nofile 65536" >> /etc/security/limits.conf
```

#### 内核参数优化
```bash
# 网络参数优化
echo "net.core.somaxconn = 1024" >> /etc/sysctl.conf
echo "net.ipv4.tcp_max_syn_backlog = 1024" >> /etc/sysctl.conf
sysctl -p
```

## 10. 安全加固

### 10.1 系统安全

#### 防火墙配置
```bash
# 配置iptables规则
sudo iptables -A INPUT -p tcp --dport 22 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 80 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 443 -j ACCEPT
sudo iptables -A INPUT -p tcp --dport 3001 -s 127.0.0.1 -j ACCEPT
sudo iptables -A INPUT -j DROP

# 保存规则
sudo iptables-save > /etc/iptables/rules.v4
```

#### SSH安全配置
```bash
# 编辑SSH配置
sudo nano /etc/ssh/sshd_config

# 添加以下配置
Port 2222
PermitRootLogin no
PasswordAuthentication no
PubkeyAuthentication yes
MaxAuthTries 3
ClientAliveInterval 300
ClientAliveCountMax 2

# 重启SSH服务
sudo systemctl restart sshd
```

### 10.2 应用安全

#### 安全头配置
```typescript
// 安全中间件
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';

// 安全头
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "https:"],
    },
  },
}));

// 速率限制
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15分钟
  max: 100, // 限制每个IP 100个请求
  message: '请求过于频繁，请稍后再试'
});

app.use('/api/', limiter);
```

#### SSL/TLS 配置
```bash
# 使用Let's Encrypt获取SSL证书
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d yourdomain.com

# 设置自动续期
sudo crontab -e
0 12 * * * /usr/bin/certbot renew --quiet
```

## 11. 总结

本部署指南提供了调酒师酒吧管理系统的完整生产部署方案，包括：

### 部署要点
- **环境准备**：Node.js、PM2、Nginx等基础环境配置
- **自动化部署**：使用脚本实现一键部署和更新
- **服务管理**：PM2进程管理和Systemd服务配置
- **监控告警**：日志管理、性能监控和健康检查
- **备份恢复**：自动备份策略和灾难恢复方案
- **安全加固**：系统安全和应用安全配置

### 运维建议
- 定期检查系统资源使用情况
- 及时更新系统和应用依赖
- 定期测试备份和恢复流程
- 监控应用性能和错误日志
- 保持安全配置的最新状态

通过遵循本指南，可以确保系统在生产环境中稳定、安全、高效地运行。