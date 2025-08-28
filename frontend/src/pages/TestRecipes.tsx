import React from 'react';

const TestRecipes: React.FC = () => {
  console.log('🧪 TestRecipes组件正在渲染...');
  
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold text-gray-900 mb-4">测试配方页面</h1>
      <p className="text-gray-600 mb-4">这是一个简单的测试页面，用于验证路由和组件渲染是否正常。</p>
      <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded">
        ✅ 如果你能看到这个页面，说明路由和基本渲染功能正常！
      </div>
    </div>
  );
};

export default TestRecipes;