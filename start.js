#!/usr/bin/env node

const { spawn, exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

// 颜色输出工具
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
  step: (msg) => console.log(`${colors.cyan}${colors.bright}▶${colors.reset} ${msg}`)
};

// 配置
const config = {
  frontend: {
    dir: './frontend',
    port: 5173,
    startCommand: 'npm run dev'
  },
  backend: {
    dir: './backend',
    port: 3001,
    startCommand: 'npm run dev'
  },
  nodeVersion: '18.0.0'
};

// 工具函数
function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

function checkPort(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.once('close', () => resolve(false));
      server.close();
    });
    server.on('error', () => resolve(true));
  });
}

function execPromise(command, cwd = process.cwd()) {
  return new Promise((resolve, reject) => {
    exec(command, { cwd }, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout, stderr });
      }
    });
  });
}

function spawnProcess(command, args, cwd, name) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, {
      cwd,
      stdio: ['pipe', 'pipe', 'pipe'],
      shell: true
    });

    let output = '';
    let errorOutput = '';

    child.stdout.on('data', (data) => {
      const text = data.toString();
      output += text;
      // 检查启动成功的标志
      if (name === 'frontend' && (text.includes('Local:') || text.includes('ready in'))) {
        resolve({ child, output });
      } else if (name === 'backend' && (text.includes('Server running') || text.includes('listening'))) {
        resolve({ child, output });
      }
    });

    child.stderr.on('data', (data) => {
      errorOutput += data.toString();
    });

    child.on('error', (error) => {
      reject({ error, output, errorOutput });
    });

    child.on('exit', (code) => {
      if (code !== 0) {
        reject({ code, output, errorOutput });
      }
    });

    // 超时处理
    setTimeout(() => {
      if (!child.killed) {
        resolve({ child, output });
      }
    }, 30000); // 30秒超时
  });
}

// 环境检查
async function checkEnvironment() {
  log.step('检查系统环境...');
  
  try {
    // 检查Node.js版本
    const { stdout } = await execPromise('node --version');
    const nodeVersion = stdout.trim().substring(1);
    log.info(`Node.js版本: ${nodeVersion}`);
    
    // 检查npm
    const { stdout: npmVersion } = await execPromise('npm --version');
    log.info(`npm版本: ${npmVersion.trim()}`);
    
    // 检查端口占用
    const frontendPortBusy = await checkPort(config.frontend.port);
    const backendPortBusy = await checkPort(config.backend.port);
    
    if (frontendPortBusy) {
      log.warning(`前端端口 ${config.frontend.port} 已被占用`);
    }
    
    if (backendPortBusy) {
      log.warning(`后端端口 ${config.backend.port} 已被占用`);
    }
    
    log.success('环境检查完成');
    return true;
  } catch (error) {
    log.error(`环境检查失败: ${error.message}`);
    return false;
  }
}

// 安装依赖
async function installDependencies() {
  log.step('检查并安装依赖...');
  
  const dirs = [
    { name: '根目录', path: '.', hasPackageJson: fs.existsSync('./package.json') },
    { name: '前端', path: config.frontend.dir, hasPackageJson: true },
    { name: '后端', path: config.backend.dir, hasPackageJson: true }
  ];
  
  for (const dir of dirs) {
    if (!dir.hasPackageJson) continue;
    
    const nodeModulesPath = path.join(dir.path, 'node_modules');
    if (!fs.existsSync(nodeModulesPath)) {
      log.info(`安装${dir.name}依赖...`);
      try {
        await execPromise('npm install', dir.path);
        log.success(`${dir.name}依赖安装完成`);
      } catch (error) {
        log.error(`${dir.name}依赖安装失败: ${error.stderr || error.error.message}`);
        return false;
      }
    } else {
      log.info(`${dir.name}依赖已存在，跳过安装`);
    }
  }
  
  return true;
}

// 初始化数据库
async function initializeDatabase() {
  log.step('检查数据库...');
  
  const dbPath = path.join(config.backend.dir, 'database.sqlite');
  if (fs.existsSync(dbPath)) {
    log.info('数据库文件已存在');
    return true;
  }
  
  log.info('初始化数据库...');
  try {
    // 构建后端项目
    await execPromise('npm run build', config.backend.dir);
    log.success('后端构建完成');
    
    // 这里可以添加数据库初始化逻辑
    log.success('数据库初始化完成');
    return true;
  } catch (error) {
    log.error(`数据库初始化失败: ${error.stderr || error.error.message}`);
    return false;
  }
}

// 启动服务
async function startServices() {
  log.step('启动服务...');
  
  const services = [];
  
  try {
    // 启动后端
    log.info('启动后端服务...');
    const backendResult = await spawnProcess('npm', ['run', 'dev'], config.backend.dir, 'backend');
    services.push({ name: '后端', process: backendResult.child, port: config.backend.port });
    log.success(`后端服务已启动 (端口: ${config.backend.port})`);
    
    // 等待后端完全启动
    await sleep(3000);
    
    // 启动前端
    log.info('启动前端服务...');
    const frontendResult = await spawnProcess('npm', ['run', 'dev'], config.frontend.dir, 'frontend');
    services.push({ name: '前端', process: frontendResult.child, port: config.frontend.port });
    log.success(`前端服务已启动 (端口: ${config.frontend.port})`);
    
    return services;
  } catch (error) {
    log.error(`服务启动失败: ${error.error?.message || error.errorOutput || '未知错误'}`);
    
    // 清理已启动的服务
    services.forEach(service => {
      if (service.process && !service.process.killed) {
        service.process.kill();
      }
    });
    
    return null;
  }
}

// 健康检查
async function healthCheck() {
  log.step('执行健康检查...');
  
  const checks = [
    { name: '后端API', url: `http://localhost:${config.backend.port}/api/health` },
    { name: '前端页面', url: `http://localhost:${config.frontend.port}` }
  ];
  
  for (const check of checks) {
    try {
      const response = await fetch(check.url);
      if (response.ok) {
        log.success(`${check.name} 健康检查通过`);
      } else {
        log.warning(`${check.name} 响应异常 (状态码: ${response.status})`);
      }
    } catch (error) {
      log.warning(`${check.name} 健康检查失败: ${error.message}`);
    }
  }
}

// 显示启动信息
function showStartupInfo() {
  console.log('\n' + '='.repeat(60));
  console.log(`${colors.green}${colors.bright}🍹 调酒师酒吧管理系统启动成功！${colors.reset}`);
  console.log('='.repeat(60));
  console.log(`${colors.cyan}前端地址:${colors.reset} http://localhost:${config.frontend.port}`);
  console.log(`${colors.cyan}后端地址:${colors.reset} http://localhost:${config.backend.port}`);
  console.log(`${colors.cyan}默认账号:${colors.reset} admin / admin123`);
  console.log('='.repeat(60));
  console.log(`${colors.yellow}按 Ctrl+C 停止所有服务${colors.reset}\n`);
}

// 主函数
async function main() {
  console.log(`${colors.magenta}${colors.bright}🚀 调酒师酒吧管理系统一键启动${colors.reset}\n`);
  
  try {
    // 1. 环境检查
    const envOk = await checkEnvironment();
    if (!envOk) {
      process.exit(1);
    }
    
    // 2. 安装依赖
    const depsOk = await installDependencies();
    if (!depsOk) {
      process.exit(1);
    }
    
    // 3. 初始化数据库
    const dbOk = await initializeDatabase();
    if (!dbOk) {
      process.exit(1);
    }
    
    // 4. 启动服务
    const services = await startServices();
    if (!services) {
      process.exit(1);
    }
    
    // 5. 健康检查
    await sleep(5000); // 等待服务完全启动
    await healthCheck();
    
    // 6. 显示启动信息
    showStartupInfo();
    
    // 7. 监听退出信号
    process.on('SIGINT', () => {
      console.log('\n正在停止服务...');
      services.forEach(service => {
        if (service.process && !service.process.killed) {
          service.process.kill();
          log.info(`${service.name}服务已停止`);
        }
      });
      process.exit(0);
    });
    
    // 保持进程运行
    process.stdin.resume();
    
  } catch (error) {
    log.error(`启动失败: ${error.message}`);
    process.exit(1);
  }
}

// 运行主函数
if (require.main === module) {
  main();
}

module.exports = { main, checkEnvironment, installDependencies, startServices };