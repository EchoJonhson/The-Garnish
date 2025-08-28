#!/usr/bin/env node

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`),
  debug: (msg) => console.log(`${colors.cyan}🔍${colors.reset} ${msg}`)
};

// 服务配置
const services = {
  backend: {
    name: '后端服务',
    dir: './backend',
    command: 'npm',
    args: ['run', 'dev'],
    port: 3001,
    healthPath: '/api/health',
    startupPatterns: [
      'Server running',
      'listening on port',
      'started on port'
    ],
    color: colors.blue
  },
  frontend: {
    name: '前端服务',
    dir: './frontend',
    command: 'npm',
    args: ['run', 'dev'],
    port: 5173,
    healthPath: '/',
    startupPatterns: [
      'Local:',
      'ready in',
      'dev server running'
    ],
    color: colors.green
  }
};

// 服务管理器类
class ServiceManager {
  constructor() {
    this.runningServices = new Map();
    this.startupTimeouts = new Map();
    this.isShuttingDown = false;
  }

  // 检查端口是否可用
  async checkPort(port) {
    return new Promise((resolve) => {
      const server = net.createServer();
      server.listen(port, () => {
        server.once('close', () => resolve(true));
        server.close();
      });
      server.on('error', () => resolve(false));
    });
  }

  // 等待端口可用
  async waitForPort(port, timeout = 30000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const available = await this.checkPort(port);
      if (!available) {
        return true; // 端口被占用，说明服务已启动
      }
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
    return false;
  }

  // 启动单个服务
  async startService(serviceName) {
    const config = services[serviceName];
    if (!config) {
      throw new Error(`未知服务: ${serviceName}`);
    }

    if (this.runningServices.has(serviceName)) {
      log.warning(`${config.name}已在运行中`);
      return this.runningServices.get(serviceName);
    }

    log.info(`启动${config.name}...`);

    // 检查工作目录
    if (!fs.existsSync(config.dir)) {
      throw new Error(`服务目录不存在: ${config.dir}`);
    }

    // 检查package.json
    const packageJsonPath = path.join(config.dir, 'package.json');
    if (!fs.existsSync(packageJsonPath)) {
      throw new Error(`package.json不存在: ${packageJsonPath}`);
    }

    return new Promise((resolve, reject) => {
      const child = spawn(config.command, config.args, {
        cwd: config.dir,
        stdio: ['pipe', 'pipe', 'pipe'],
        shell: true
      });

      let output = '';
      let errorOutput = '';
      let isStarted = false;

      // 处理标准输出
      child.stdout.on('data', (data) => {
        const text = data.toString();
        output += text;
        
        // 添加颜色前缀
        const lines = text.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          console.log(`${config.color}[${config.name}]${colors.reset} ${line}`);
        });

        // 检查启动成功标志
        if (!isStarted && config.startupPatterns.some(pattern => text.includes(pattern))) {
          isStarted = true;
          this.runningServices.set(serviceName, {
            process: child,
            config,
            startTime: new Date(),
            output
          });
          log.success(`${config.name}启动成功 (PID: ${child.pid})`);
          resolve(child);
        }
      });

      // 处理错误输出
      child.stderr.on('data', (data) => {
        const text = data.toString();
        errorOutput += text;
        
        // 显示错误信息（某些框架的正常日志也会输出到stderr）
        const lines = text.split('\n').filter(line => line.trim());
        lines.forEach(line => {
          if (line.includes('error') || line.includes('Error')) {
            console.log(`${colors.red}[${config.name}]${colors.reset} ${line}`);
          } else {
            console.log(`${config.color}[${config.name}]${colors.reset} ${line}`);
          }
        });
      });

      // 处理进程错误
      child.on('error', (error) => {
        log.error(`${config.name}启动失败: ${error.message}`);
        reject(error);
      });

      // 处理进程退出
      child.on('exit', (code, signal) => {
        this.runningServices.delete(serviceName);
        if (code !== 0 && !this.isShuttingDown) {
          log.error(`${config.name}异常退出 (代码: ${code}, 信号: ${signal})`);
          if (!isStarted) {
            reject(new Error(`${config.name}启动失败，退出代码: ${code}`));
          }
        } else if (!this.isShuttingDown) {
          log.info(`${config.name}已停止`);
        }
      });

      // 设置启动超时
      const timeout = setTimeout(() => {
        if (!isStarted) {
          log.warning(`${config.name}启动超时，但进程仍在运行`);
          this.runningServices.set(serviceName, {
            process: child,
            config,
            startTime: new Date(),
            output
          });
          resolve(child);
        }
      }, 30000); // 30秒超时

      this.startupTimeouts.set(serviceName, timeout);
    });
  }

  // 停止单个服务
  async stopService(serviceName) {
    const service = this.runningServices.get(serviceName);
    if (!service) {
      log.warning(`服务 ${serviceName} 未在运行`);
      return;
    }

    log.info(`停止${service.config.name}...`);
    
    // 清除启动超时
    const timeout = this.startupTimeouts.get(serviceName);
    if (timeout) {
      clearTimeout(timeout);
      this.startupTimeouts.delete(serviceName);
    }

    // 优雅停止
    service.process.kill('SIGTERM');
    
    // 等待进程结束
    await new Promise((resolve) => {
      const forceTimeout = setTimeout(() => {
        if (!service.process.killed) {
          log.warning(`强制停止${service.config.name}`);
          service.process.kill('SIGKILL');
        }
        resolve();
      }, 5000);
      
      service.process.on('exit', () => {
        clearTimeout(forceTimeout);
        resolve();
      });
    });

    this.runningServices.delete(serviceName);
    log.success(`${service.config.name}已停止`);
  }

  // 启动所有服务
  async startAll() {
    log.info('启动所有服务...');
    
    try {
      // 先启动后端
      await this.startService('backend');
      
      // 等待后端完全启动
      log.info('等待后端服务完全启动...');
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // 再启动前端
      await this.startService('frontend');
      
      log.success('所有服务启动完成');
      return true;
    } catch (error) {
      log.error(`服务启动失败: ${error.message}`);
      await this.stopAll();
      return false;
    }
  }

  // 停止所有服务
  async stopAll() {
    this.isShuttingDown = true;
    log.info('停止所有服务...');
    
    const serviceNames = Array.from(this.runningServices.keys());
    const stopPromises = serviceNames.map(name => this.stopService(name));
    
    await Promise.all(stopPromises);
    log.success('所有服务已停止');
  }

  // 重启服务
  async restartService(serviceName) {
    log.info(`重启服务: ${serviceName}`);
    await this.stopService(serviceName);
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.startService(serviceName);
  }

  // 重启所有服务
  async restartAll() {
    log.info('重启所有服务...');
    await this.stopAll();
    await new Promise(resolve => setTimeout(resolve, 2000));
    await this.startAll();
  }

  // 获取服务状态
  getStatus() {
    const status = {};
    
    for (const [name, service] of this.runningServices) {
      status[name] = {
        name: service.config.name,
        pid: service.process.pid,
        port: service.config.port,
        startTime: service.startTime,
        uptime: Date.now() - service.startTime.getTime()
      };
    }
    
    return status;
  }

  // 显示状态
  showStatus() {
    const status = this.getStatus();
    const serviceNames = Object.keys(status);
    
    if (serviceNames.length === 0) {
      log.info('没有运行中的服务');
      return;
    }
    
    console.log('\n' + '='.repeat(60));
    console.log(`${colors.cyan}${colors.bright}服务状态${colors.reset}`);
    console.log('='.repeat(60));
    
    for (const name of serviceNames) {
      const service = status[name];
      const uptime = Math.floor(service.uptime / 1000);
      console.log(`${colors.green}●${colors.reset} ${service.name}`);
      console.log(`  PID: ${service.pid}`);
      console.log(`  端口: ${service.port}`);
      console.log(`  运行时间: ${uptime}秒`);
      console.log(`  启动时间: ${service.startTime.toLocaleString()}`);
      console.log('');
    }
  }

  // 健康检查
  async healthCheck() {
    const status = this.getStatus();
    const results = {};
    
    for (const [name, service] of Object.entries(status)) {
      try {
        const config = services[name];
        const url = `http://localhost:${config.port}${config.healthPath}`;
        
        const response = await fetch(url, { 
          timeout: 5000,
          signal: AbortSignal.timeout(5000)
        });
        
        results[name] = {
          status: response.ok ? 'healthy' : 'unhealthy',
          statusCode: response.status,
          url
        };
      } catch (error) {
        results[name] = {
          status: 'error',
          error: error.message,
          url: `http://localhost:${services[name].port}${services[name].healthPath}`
        };
      }
    }
    
    return results;
  }
}

// 命令行接口
if (require.main === module) {
  const manager = new ServiceManager();
  const command = process.argv[2];
  
  // 处理退出信号
  process.on('SIGINT', async () => {
    console.log('\n收到退出信号，正在停止服务...');
    await manager.stopAll();
    process.exit(0);
  });
  
  process.on('SIGTERM', async () => {
    console.log('\n收到终止信号，正在停止服务...');
    await manager.stopAll();
    process.exit(0);
  });
  
  switch (command) {
    case 'start':
      manager.startAll().then(success => {
        if (success) {
          console.log('\n按 Ctrl+C 停止所有服务');
          // 保持进程运行
          process.stdin.resume();
        } else {
          process.exit(1);
        }
      });
      break;
      
    case 'stop':
      manager.stopAll().then(() => process.exit(0));
      break;
      
    case 'restart':
      manager.restartAll().then(() => {
        console.log('\n按 Ctrl+C 停止所有服务');
        process.stdin.resume();
      });
      break;
      
    case 'status':
      manager.showStatus();
      break;
      
    case 'health':
      manager.healthCheck().then(results => {
        console.log('\n健康检查结果:');
        for (const [name, result] of Object.entries(results)) {
          const status = result.status === 'healthy' ? 
            `${colors.green}✓ 健康${colors.reset}` : 
            `${colors.red}✗ ${result.status}${colors.reset}`;
          console.log(`${name}: ${status}`);
        }
      });
      break;
      
    default:
      console.log(`${colors.cyan}服务管理器${colors.reset}\n`);
      console.log('用法:');
      console.log('  node service-manager.js start   - 启动所有服务');
      console.log('  node service-manager.js stop    - 停止所有服务');
      console.log('  node service-manager.js restart - 重启所有服务');
      console.log('  node service-manager.js status  - 显示服务状态');
      console.log('  node service-manager.js health  - 健康检查');
      break;
  }
}

module.exports = ServiceManager;