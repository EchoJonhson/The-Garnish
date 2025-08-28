// 测试登录API的简单脚本
async function testLogin() {
  try {
    console.log('测试登录API...');
    
    const response = await fetch('http://localhost:3001/api/auth/login', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        username: 'admin',
        password: 'admin123'
      })
    });
    
    console.log('响应状态:', response.status);
    
    const data = await response.json();
    console.log('响应数据:', JSON.stringify(data, null, 2));
    
    if (response.ok && data.success) {
      console.log('✅ 登录API工作正常');
      console.log('用户信息:', data.user);
      console.log('Token:', data.token ? '已生成' : '未生成');
    } else {
      console.log('❌ 登录失败:', data.message || '未知错误');
    }
    
  } catch (error) {
    console.error('❌ 登录测试失败:');
    console.error('错误类型:', error.constructor.name);
    console.error('错误消息:', error.message);
  }
}

testLogin();