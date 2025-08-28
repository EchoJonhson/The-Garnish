#!/usr/bin/env node

const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');
const net = require('net');

// 颜色输出
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m'
};

const log = {
  info: (msg) => console.log(`${colors.blue}ℹ${colors.reset} ${msg}`),
  success: (msg) => console.log(`${colors.green}✓${colors.reset} ${msg}`),
  warning: (msg) => console.log(`${colors.yellow}⚠${colors.reset} ${msg}`),
  error: (msg) => console.log(`${colors.red}✗${colors.reset} ${msg}`)
};

// 系统要求
const requirements = {
  node: {
    min: '18.0.0',
    recommended: '20.0.0'
  },
  npm: {
    min: '8.0.0',
    recommended: '10.0.0'
  },
  ports: [3001, 5173],
  memory: 512, // MB
  disk: 100 // MB
};

// 工具函数
function execPromise(command) {
  return new Promise((resolve, reject) => {
    exec(command, (error, stdout, stderr) => {
      if (error) {
        reject({ error, stdout, stderr });
      } else {
        resolve({ stdout: stdout.trim(), stderr: stderr.trim() });
      }
    });
  });
}

function compareVersions(version1, version2) {
  const v1parts = version1.split('.').map(Number);
  const v2parts = version2.split('.').map(Number);
  
  for (let i = 0; i < Math.max(v1parts.length, v2parts.length); i++) {
    const v1part = v1parts[i] || 0;
    const v2part = v2parts[i] || 0;
    
    if (v1part > v2part) return 1;
    if (v1part < v2part) return -1;
  }
  
  return 0;
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

// 检查Node.js版本
async function checkNodeVersion() {
  try {
    const { stdout } = await execPromise('node --version');
    const version = stdout.substring(1); // 移除'v'前缀
    
    const minCheck = compareVersions(version, requirements.node.min);
    const recCheck = compareVersions(version, requirements.node.recommended);
    
    if (minCheck >= 0) {
      if (recCheck >= 0) {
        log.success(`Node.js版本: ${version} (推荐版本)`);
      } else {
        log.warning(`Node.js版本: ${version} (满足最低要求，推荐升级到 ${requirements.node.recommended}+)`);
      }
      return true;
    } else {
      log.error(`Node.js版本过低: ${version} (最低要求: ${requirements.node.min})`);
      return false;
    }
  } catch (error) {
    log.error('未找到Node.js，请先安装Node.js');
    return false;
  }
}

// 检查npm版本
async function checkNpmVersion() {
  try {
    const { stdout } = await execPromise('npm --version');
    const version = stdout;
    
    const minCheck = compareVersions(version, requirements.npm.min);
    const recCheck = compareVersions(version, requirements.npm.recommended);
    
    if (minCheck >= 0) {
      if (recCheck >= 0) {
        log.success(`npm版本: ${version} (推荐版本)`);
      } else {
        log.warning(`npm版本: ${version} (满足最低要求，推荐升级到 ${requirements.npm.recommended}+)`);
      }
      return true;
    } else {
      log.error(`npm版本过低: ${version} (最低要求: ${requirements.npm.min})`);
      return false;
    }
  } catch (error) {
    log.error('未找到npm');
    return false;
  }
}

// 检查端口占用
async function checkPorts() {
  let allPortsAvailable = true;
  
  for (const port of requirements.ports) {
    const isOccupied = await checkPort(port);
    if (isOccupied) {
      log.warning(`端口 ${port} 已被占用`);
      allPortsAvailable = false;
    } else {
      log.success(`端口 ${port} 可用`);
    }
  }
  
  return allPortsAvailable;
}

// 检查项目文件
function checkProjectFiles() {
  const requiredFiles = [
    'package.json',
    'frontend/package.json',
    'backend/package.json',
    'backend/.env.example'
  ];
  
  let allFilesExist = true;
  
  for (const file of requiredFiles) {
    if (fs.existsSync(file)) {
      log.success(`文件存在: ${file}`);
    } else {
      log.error(`文件缺失: ${file}`);
      allFilesExist = false;
    }
  }
  
  return allFilesExist;
}

// 检查环境配置
function checkEnvironmentConfig() {
  const envPath = 'backend/.env';
  
  if (fs.existsSync(envPath)) {
    log.success('后端环境配置文件存在');
    
    try {
      const envContent = fs.readFileSync(envPath, 'utf8');
      const requiredVars = ['PORT', 'JWT_SECRET', 'DB_PATH', 'CORS_ORIGIN'];
      
      let allVarsPresent = true;
      for (const varName of requiredVars) {
        if (envContent.includes(`${varName}=`)) {
          log.success(`环境变量配置: ${varName}`);
        } else {
          log.warning(`环境变量缺失: ${varName}`);
          allVarsPresent = false;
        }
      }
      
      return allVarsPresent;
    } catch (error) {
      log.error('无法读取环境配置文件');
      return false;
    }
  } else {
    log.warning('后端环境配置文件不存在，将使用默认配置');
    return true; // 可以使用.env.example作为默认配置
  }
}

// 检查系统资源
async function checkSystemResources() {
  try {
    // 检查可用内存
    const { stdout: memInfo } = await execPromise('node -e "console.log(Math.round(process.memoryUsage().heapTotal / 1024 / 1024))";');
    const availableMemory = parseInt(memInfo);
    
    if (availableMemory >= requirements.memory) {
      log.success(`可用内存: ${availableMemory}MB (满足要求)`);
    } else {
      log.warning(`可用内存: ${availableMemory}MB (推荐: ${requirements.memory}MB+)`);
    }
    
    // 检查磁盘空间
    const { stdout: diskInfo } = await execPromise('df -h . | tail -1 | awk "{print $4}"');
    log.info(`磁盘可用空间: ${diskInfo}`);
    
    return true;
  } catch (error) {
    log.warning('无法检查系统资源');
    return true; // 不阻止启动
  }
}

// 主检查函数
async function checkEnvironment() {
  console.log(`${colors.cyan}🔍 系统环境检查${colors.reset}\n`);
  
  const checks = [
    { name: 'Node.js版本', fn: checkNodeVersion, critical: true },
    { name: 'npm版本', fn: checkNpmVersion, critical: true },
    { name: '端口可用性', fn: checkPorts, critical: false },
    { name: '项目文件', fn: checkProjectFiles, critical: true },
    { name: '环境配置', fn: checkEnvironmentConfig, critical: false },
    { name: '系统资源', fn: checkSystemResources, critical: false }
  ];
  
  let criticalIssues = 0;
  let warnings = 0;
  
  for (const check of checks) {
    console.log(`\n检查 ${check.name}...`);
    try {
      const result = await check.fn();
      if (!result) {
        if (check.critical) {
          criticalIssues++;
        } else {
          warnings++;
        }
      }
    } catch (error) {
      log.error(`检查 ${check.name} 时出错: ${error.message}`);
      if (check.critical) {
        criticalIssues++;
      } else {
        warnings++;
      }
    }
  }
  
  console.log('\n' + '='.repeat(50));
  
  if (criticalIssues === 0) {
    if (warnings === 0) {
      log.success('✨ 环境检查完全通过！系统已准备就绪。');
    } else {
      log.warning(`⚠️  环境检查基本通过，但有 ${warnings} 个警告。`);
    }
    console.log(`${colors.green}可以运行: npm run start${colors.reset}`);
    return true;
  } else {
    log.error(`❌ 环境检查失败，发现 ${criticalIssues} 个关键问题。`);
    console.log(`${colors.red}请解决上述问题后重试${colors.reset}`);
    return false;
  }
}

// 如果直接运行此脚本
if (require.main === module) {
  checkEnvironment().then(success => {
    process.exit(success ? 0 : 1);
  });
}

module.exports = { checkEnvironment };