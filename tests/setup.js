// Jest测试环境设置文件
// 为测试环境配置全局的fetch函数

// 使用whatwg-fetch polyfill
require('whatwg-fetch');

// 注意：whatwg-fetch会自动设置全局的fetch、Request、Response等

// 设置测试超时时间
jest.setTimeout(30000);

// 在每个测试前的设置
beforeEach(() => {
  // 可以在这里添加每个测试前的通用设置
});

// 在每个测试后的清理
afterEach(() => {
  // 可以在这里添加每个测试后的通用清理
});