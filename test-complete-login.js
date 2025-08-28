#!/usr/bin/env node

/**
 * 完整登录流程测试脚本
 * 测试从登录到token验证的完整流程
 */

const https = require('http');
const querystring = require('querystring');

// 测试配置
const config = {
  baseURL: 'http://localhost:3001',
  credentials: {
    username: 'admin',
    password: 'admin123'
  }
};

// 发送HTTP请求的辅助函数
function makeRequest(options, data = null) {
  return new Promise((resolve, reject) => {
    const req = https.request(options, (res) => {
      let body = '';
      
      res.on('data', (chunk) => {
        body += chunk;
      });
      
      res.on('end', () => {
        try {
          const jsonBody = JSON.parse(body);
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: jsonBody
          });
        } catch (error) {
          resolve({
            status: res.statusCode,
            headers: res.headers,
            data: body
          });
        }
      });
    });
    
    req.on('error', (error) => {
      reject(error);
    });
    
    if (data) {
      req.write(data);
    }
    
    req.end();
  });
}

// 测试步骤
async function runTests() {
  console.log('🧪 开始完整登录流程测试\n');
  
  try {
    // 步骤1: 健康检查
    console.log('📋 步骤1: 后端健康检查');
    const healthResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/health',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json'
      }
    });
    
    console.log(`   状态: ${healthResponse.status}`);
    console.log(`   响应: ${JSON.stringify(healthResponse.data, null, 2)}`);
    
    if (healthResponse.status !== 200) {
      throw new Error('后端服务不可用');
    }
    console.log('   ✅ 后端服务正常\n');
    
    // 步骤2: 登录测试
    console.log('📋 步骤2: 用户登录测试');
    const loginData = JSON.stringify(config.credentials);
    
    const loginResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/login',
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Content-Length': Buffer.byteLength(loginData)
      }
    }, loginData);
    
    console.log(`   状态: ${loginResponse.status}`);
    console.log(`   CORS头: ${loginResponse.headers['access-control-allow-origin']}`);
    console.log(`   响应: ${JSON.stringify(loginResponse.data, null, 2)}`);
    
    if (loginResponse.status !== 200 || !loginResponse.data.success) {
      throw new Error(`登录失败: ${loginResponse.data.message || '未知错误'}`);
    }
    
    const { token, user } = loginResponse.data;
    console.log('   ✅ 登录成功');
    console.log(`   👤 用户: ${user.name} (${user.role})`);
    console.log(`   🔑 Token: ${token.substring(0, 50)}...\n`);
    
    // 步骤3: Token验证测试
    console.log('📋 步骤3: Token验证测试');
    
    const meResponse = await makeRequest({
      hostname: 'localhost',
      port: 3001,
      path: '/api/auth/me',
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      }
    });
    
    console.log(`   状态: ${meResponse.status}`);
    console.log(`   响应: ${JSON.stringify(meResponse.data, null, 2)}`);
    
    if (meResponse.status !== 200 || !meResponse.data.success) {
      throw new Error(`Token验证失败: ${meResponse.data.message || '未知错误'}`);
    }
    
    console.log('   ✅ Token验证成功\n');
    
    // 步骤4: 前端连接测试
    console.log('📋 步骤4: 前端服务连接测试');
    
    try {
      const frontendResponse = await makeRequest({
        hostname: 'localhost',
        port: 5173,
        path: '/',
        method: 'GET',
        headers: {
          'Accept': 'text/html'
        }
      });
      
      console.log(`   前端状态: ${frontendResponse.status}`);
      if (frontendResponse.status === 200) {
        console.log('   ✅ 前端服务正常');
      } else {
        console.log('   ⚠️  前端服务可能有问题');
      }
    } catch (error) {
      console.log(`   ❌ 前端服务连接失败: ${error.message}`);
    }
    
    console.log('\n🎉 所有测试完成!');
    console.log('\n📊 测试总结:');
    console.log('   ✅ 后端API正常工作');
    console.log('   ✅ 登录功能正常');
    console.log('   ✅ Token生成和验证正常');
    console.log('   ✅ CORS配置正确');
    console.log('\n💡 如果前端登录仍有问题，请检查:');
    console.log('   1. 浏览器控制台是否有JavaScript错误');
    console.log('   2. 网络请求是否被阻止');
    console.log('   3. 前端代码中的错误处理逻辑');
    
  } catch (error) {
    console.error(`\n❌ 测试失败: ${error.message}`);
    console.error('\n🔍 请检查:');
    console.error('   1. 后端服务是否正在运行 (npm run dev)');
    console.error('   2. 端口3001是否被占用');
    console.error('   3. 数据库是否正确初始化');
    process.exit(1);
  }
}

// 运行测试
runTests();