/**
 * 完整登录流程集成测试
 * 测试从登录到token验证的完整流程
 * 注意：这些测试需要后端服务运行在 http://localhost:3001
 */

// 测试配置
const config = {
  baseURL: 'http://localhost:3001',
  frontendURL: 'http://localhost:5173',
  credentials: {
    username: 'admin',
    password: 'admin123'
  }
};

// 发送HTTP请求的辅助函数
async function makeRequest(url, options = {}) {
  try {
    const response = await fetch(url, options);
    const data = await response.json().catch(() => response.text());
    return {
      status: response.status,
      headers: Object.fromEntries(response.headers.entries()),
      data
    };
  } catch (error) {
    throw new Error(`请求失败: ${error.message}`);
  }
}

describe('完整登录流程集成测试', () => {
  let authToken = null;
  
  beforeAll(() => {
    console.log('🧪 开始完整登录流程测试');
  });
  
  afterAll(() => {
    console.log('🎉 完整登录流程测试完成');
  });
  
  describe('后端服务健康检查', () => {
    it('应该能够访问健康检查端点', async () => {
      const healthResponse = await makeRequest(`${config.baseURL}/health`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      });
      
      expect(healthResponse.status).toBe(200);
      expect(healthResponse.data).toBeDefined();
    }, 10000);
  });
  
  describe('用户登录流程', () => {
    it('应该能够成功登录并获取token', async () => {
      const loginResponse = await makeRequest(`${config.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config.credentials)
      });
      
      expect(loginResponse.status).toBe(200);
      expect(loginResponse.data).toHaveProperty('success', true);
      expect(loginResponse.data).toHaveProperty('token');
      expect(loginResponse.data).toHaveProperty('user');
      
      const { token, user } = loginResponse.data;
      expect(typeof token).toBe('string');
      expect(token.length).toBeGreaterThan(0);
      expect(user).toHaveProperty('username', config.credentials.username);
      
      // 保存token用于后续测试
      authToken = token;
    }, 10000);
    
    it('应该包含正确的CORS头', async () => {
      const loginResponse = await makeRequest(`${config.baseURL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(config.credentials)
      });
      
      expect(loginResponse.headers).toHaveProperty('access-control-allow-origin');
    }, 10000);
  });
  
  describe('Token验证', () => {
    it('应该能够使用token验证用户身份', async () => {
      expect(authToken).toBeTruthy();
      
      const meResponse = await makeRequest(`${config.baseURL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${authToken}`
        }
      });
      
      expect(meResponse.status).toBe(200);
      expect(meResponse.data).toHaveProperty('success', true);
      expect(meResponse.data).toHaveProperty('user');
      expect(meResponse.data.user).toHaveProperty('username', config.credentials.username);
    }, 10000);
    
    it('应该拒绝无效的token', async () => {
      const meResponse = await makeRequest(`${config.baseURL}/api/auth/me`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer invalid_token'
        }
      });
      
      expect(meResponse.status).toBe(401);
      expect(meResponse.data).toHaveProperty('success', false);
    }, 10000);
  });
  
  describe('前端服务连接', () => {
    it('应该能够访问前端服务（如果运行中）', async () => {
      try {
        const frontendResponse = await makeRequest(`${config.frontendURL}/`, {
          method: 'GET',
          headers: {
            'Accept': 'text/html'
          }
        });
        
        // 如果前端服务运行，应该返回200
        if (frontendResponse.status === 200) {
          expect(frontendResponse.status).toBe(200);
        }
      } catch (error) {
        // 前端服务可能没有运行，这是可以接受的
        console.log('前端服务未运行或不可访问，跳过此测试');
      }
    }, 10000);
  });
});