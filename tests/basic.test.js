// 基础测试 - 验证测试框架是否正常工作
// 这些测试不依赖于外部服务

describe('基础功能测试', () => {
  describe('JavaScript基础功能', () => {
    it('应该能够执行基本的数学运算', () => {
      expect(2 + 2).toBe(4);
      expect(10 - 5).toBe(5);
      expect(3 * 4).toBe(12);
      expect(8 / 2).toBe(4);
    });
    
    it('应该能够处理字符串操作', () => {
      const testString = 'The Garnish';
      expect(testString.toLowerCase()).toBe('the garnish');
      expect(testString.includes('Garnish')).toBe(true);
      expect(testString.split(' ')).toEqual(['The', 'Garnish']);
    });
    
    it('应该能够处理数组操作', () => {
      const testArray = [1, 2, 3, 4, 5];
      expect(testArray.length).toBe(5);
      expect(testArray.includes(3)).toBe(true);
      expect(testArray.filter(x => x > 3)).toEqual([4, 5]);
    });
  });
  
  describe('异步操作测试', () => {
    it('应该能够处理Promise', async () => {
      const promise = new Promise(resolve => {
        setTimeout(() => resolve('success'), 100);
      });
      
      const result = await promise;
      expect(result).toBe('success');
    });
    
    it('应该能够处理async/await', async () => {
      const asyncFunction = async () => {
        return 'async result';
      };
      
      const result = await asyncFunction();
      expect(result).toBe('async result');
    });
  });
  
  describe('配置验证', () => {
    it('应该能够访问环境变量', () => {
      // 验证Node.js环境
      expect(process.env.NODE_ENV).toBeDefined();
      expect(typeof process.version).toBe('string');
    });
    
    it('应该能够使用fetch API', () => {
      // 验证fetch polyfill是否正确加载
      expect(typeof fetch).toBe('function');
      expect(typeof Request).toBe('function');
      expect(typeof Response).toBe('function');
    });
  });
});