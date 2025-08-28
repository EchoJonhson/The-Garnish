import React, { createContext, useContext, useState, useEffect, type ReactNode } from 'react';
import { authAPI } from '../utils/api';

// 用户信息接口
interface User {
  id: number;
  username: string;
  name: string;
  role: 'admin' | 'owner' | 'bartender';
}

// 认证上下文接口
interface AuthContextType {
  user: User | null;
  token: string | null;
  login: (username: string, password: string) => Promise<void>;
  logout: () => void;
  isLoading: boolean;
  isAuthenticated: boolean;
}

// 创建认证上下文
const AuthContext = createContext<AuthContextType | undefined>(undefined);

// 认证提供者组件
export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 初始化时检查本地存储的认证信息
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedToken = localStorage.getItem('token');
        const storedUser = localStorage.getItem('user');
        
        if (storedToken && storedUser) {
          setToken(storedToken);
          setUser(JSON.parse(storedUser));
          
          // 验证token是否仍然有效
          try {
            const response = await authAPI.getCurrentUser();
            if (response.data.success) {
              setUser(response.data.user);
            } else {
              // Token无效，清除本地存储
              localStorage.removeItem('token');
              localStorage.removeItem('user');
              setToken(null);
              setUser(null);
            }
          } catch (error) {
            // Token验证失败，清除本地存储
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            setToken(null);
            setUser(null);
          }
        }
      } catch (error) {
        console.error('认证初始化失败:', error);
      } finally {
        setIsLoading(false);
      }
    };

    initAuth();
  }, []);

  // 登录函数
  const login = async (username: string, password: string): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('🔐 开始登录请求:', { username, timestamp: new Date().toISOString() });
      console.log('🌐 API基础URL:', 'http://localhost:3001/api');
      
      const response = await authAPI.login({ username, password });
      console.log('✅ 登录响应状态:', response.status);
      console.log('📦 登录响应数据:', response.data);
      console.log('🔍 响应头信息:', response.headers);
      
      if (response.data.success) {
        const { token: newToken, user: newUser } = response.data;
        
        // 保存到状态
        setToken(newToken);
        setUser(newUser);
        
        // 保存到本地存储
        localStorage.setItem('token', newToken);
        localStorage.setItem('user', JSON.stringify(newUser));
        
        console.log('登录成功:', newUser);
      } else {
        console.error('登录失败:', response.data.message);
        throw new Error(response.data.message || '登录失败');
      }
    } catch (error: any) {
      console.error('❌ 登录错误详情:', error);
      console.error('🔍 错误类型:', typeof error);
      console.error('🔍 错误代码:', error.code);
      console.error('🔍 错误消息:', error.message);
      console.error('🔍 错误响应:', error.response);
      console.error('🔍 错误请求:', error.request);
      
      // 处理网络错误
      if (error.code === 'NETWORK_ERROR' || error.message === 'Network Error') {
        console.error('🌐 网络连接错误');
        throw new Error('网络连接失败，请检查网络设置');
      }
      
      // 处理HTTP错误
      if (error.response) {
        const errorMessage = error.response.data?.message || '登录失败';
        console.error('🚫 HTTP错误:', error.response.status, errorMessage);
        console.error('📦 错误响应数据:', error.response.data);
        throw new Error(errorMessage);
      }
      
      // 处理请求错误（如CORS）
      if (error.request) {
        console.error('📡 请求错误 - 可能是CORS或网络问题');
        console.error('🔍 请求详情:', error.request);
        throw new Error('请求失败，可能是网络或CORS配置问题');
      }
      
      // 处理其他错误
      console.error('❓ 未知错误类型');
      throw new Error(error.message || '登录失败，请重试');
    } finally {
      setIsLoading(false);
    }
  };

  // 登出函数
  const logout = () => {
    setUser(null);
    setToken(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  // 计算是否已认证
  const isAuthenticated = !!user && !!token;

  const value: AuthContextType = {
    user,
    token,
    login,
    logout,
    isLoading,
    isAuthenticated,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

// 使用认证上下文的Hook
export const useAuth = (): AuthContextType => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;