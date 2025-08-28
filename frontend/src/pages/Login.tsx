import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { Wine, Lock, User, AlertCircle } from 'lucide-react';

const Login: React.FC = () => {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!username.trim() || !password.trim()) {
      setError('请输入用户名和密码');
      return;
    }

    setIsSubmitting(true);
    setError('');

    try {
      await login(username.trim(), password);
      navigate('/', { replace: true });
    } catch (err: any) {
      setError(err.message || '登录失败，请重试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-primary-500 to-primary-700 flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo和标题 */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-white rounded-full mb-4 shadow-lg">
            <Wine className="w-8 h-8 text-primary-500" />
          </div>
          <h1 className="text-3xl font-bold text-white mb-2">
            调酒师管理系统
          </h1>
          <p className="text-primary-100">
            专业的酒吧管理解决方案
          </p>
        </div>

        {/* 登录表单 */}
        <div className="card p-8">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* 错误提示 */}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-md text-red-700">
                <AlertCircle className="w-5 h-5 flex-shrink-0" />
                <span className="text-sm">{error}</span>
              </div>
            )}

            {/* 用户名输入 */}
            <div>
              <label htmlFor="username" className="block text-sm font-medium text-gray-700 mb-2">
                用户名
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <User className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="input-field pl-10"
                  placeholder="请输入用户名"
                  disabled={isSubmitting}
                  autoComplete="username"
                  autoFocus
                />
              </div>
            </div>

            {/* 密码输入 */}
            <div>
              <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-2">
                密码
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-gray-400" />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="input-field pl-10"
                  placeholder="请输入密码"
                  disabled={isSubmitting}
                  autoComplete="current-password"
                />
              </div>
            </div>

            {/* 登录按钮 */}
            <button
              type="submit"
              disabled={isSubmitting || !username.trim() || !password.trim()}
              className="w-full btn-primary disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isSubmitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  登录中...
                </>
              ) : (
                '登录'
              )}
            </button>
          </form>

          {/* 默认账号提示 */}
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h3 className="text-sm font-medium text-gray-700 mb-2">默认管理员账号</h3>
            <div className="text-sm text-gray-600 space-y-1">
              <p>用户名: <span className="font-mono bg-gray-200 px-1 rounded">admin</span></p>
              <p>密码: <span className="font-mono bg-gray-200 px-1 rounded">admin123</span></p>
            </div>
          </div>
        </div>

        {/* 版权信息 */}
        <div className="text-center mt-8">
          <p className="text-primary-100 text-sm">
            © 2024 调酒师管理系统. 保留所有权利.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;