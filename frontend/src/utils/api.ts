import axios from 'axios';

// 创建axios实例
const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// 请求拦截器 - 添加认证token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// 响应拦截器 - 处理错误
api.interceptors.response.use(
  (response) => {
    // 保持完整的response对象，以便在组件中访问response.data
    return response;
  },
  (error) => {
    console.error('API请求错误:', error);
    
    if (error.response?.status === 401) {
      // Token过期或无效，清除本地存储并跳转到登录页
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    
    // 保持错误对象的完整结构
    return Promise.reject(error);
  }
);

// 用户认证相关API
export const authAPI = {
  // 登录
  login: (credentials: { username: string; password: string }) => {
    return api.post('/auth/login', credentials);
  },
  
  // 获取当前用户信息
  getCurrentUser: () => {
    return api.get('/auth/me');
  },
  
  // 创建用户（仅店长权限）
  createUser: (userData: { username: string; password: string; name: string; role: string }) => {
    return api.post('/auth/users', userData);
  },
  
  // 获取用户列表（仅店长权限）
  getUsers: () => {
    return api.get('/auth/users');
  },
  
  // 更新用户状态（仅店长权限）
  updateUserStatus: (userId: number, isActive: boolean) => {
    return api.put(`/auth/users/${userId}/status`, { is_active: isActive });
  },
};

// 配方管理相关API
export const recipeAPI = {
  // 获取配方列表
  getRecipes: () => {
    return api.get('/recipes');
  },
  
  // 获取配方详情
  getRecipe: (id: number) => {
    return api.get(`/recipes/${id}`);
  },
  
  // 创建配方
  createRecipe: (recipeData: any) => {
    return api.post('/recipes', recipeData);
  },
  
  // 更新配方
  updateRecipe: (id: number, recipeData: any) => {
    return api.put(`/recipes/${id}`, recipeData);
  },
  
  // 删除配方
  deleteRecipe: (id: number) => {
    return api.delete(`/recipes/${id}`);
  },
};

// 库存管理相关API
export const inventoryAPI = {
  // 获取库存列表
  getInventory: () => {
    return api.get('/inventory');
  },
  
  // 库存调整
  adjustInventory: (adjustmentData: any) => {
    return api.post('/inventory/adjust', adjustmentData);
  },
  
  // 更新库存信息
  updateInventory: (id: number, inventoryData: any) => {
    return api.put(`/inventory/${id}`, inventoryData);
  },
};

// 订单处理相关API
export const orderAPI = {
  // 创建订单
  createOrder: (orderData: any) => {
    return api.post('/orders', orderData);
  },
  
  // 完成订单
  completeOrder: (id: number) => {
    return api.put(`/orders/${id}/complete`);
  },
  
  // 获取订单历史
  getOrders: (params?: any) => {
    return api.get('/orders', { params });
  },
};

// 报表分析相关API
export const reportAPI = {
  // 销售统计
  getSalesReport: (params?: any) => {
    return api.get('/reports/sales', { params });
  },
  
  // 利润分析
  getProfitReport: (params?: any) => {
    return api.get('/reports/profit', { params });
  },
};

export default api;