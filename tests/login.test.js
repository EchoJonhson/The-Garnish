// 登录API测试
// 注意：这些测试需要后端服务运行在 http://localhost:3001

describe('登录API测试', () => {
  const API_BASE_URL = 'http://localhost:3001';
  
  beforeAll(() => {
    // 在所有测试开始前的设置
    console.log('开始登录API测试...');
  });
  
  afterAll(() => {
    // 在所有测试结束后的清理
    console.log('登录API测试完成');
  });
  
  describe('POST /api/auth/login', () => {
    it('应该能够使用正确的凭证成功登录', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'admin123'
        })
      });
      
      expect(response.status).toBe(200);
      
      const data = await response.json();
      
      expect(data).toHaveProperty('success', true);
      expect(data).toHaveProperty('user');
      expect(data).toHaveProperty('token');
      expect(data.user).toHaveProperty('username', 'admin');
      expect(typeof data.token).toBe('string');
      expect(data.token.length).toBeGreaterThan(0);
    });
    
    it('应该拒绝错误的用户名', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'wronguser',
          password: 'admin123'
        })
      });
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('message');
    });
    
    it('应该拒绝错误的密码', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin',
          password: 'wrongpassword'
        })
      });
      
      expect(response.status).toBe(401);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
      expect(data).toHaveProperty('message');
    });
    
    it('应该拒绝缺少必需字段的请求', async () => {
      const response = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          username: 'admin'
          // 缺少password字段
        })
      });
      
      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toHaveProperty('success', false);
    });
  });
});