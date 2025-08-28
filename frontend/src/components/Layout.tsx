import React, { useState, useEffect } from 'react';
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import {
  Wine,
  BarChart3,
  Package,
  FileText,
  ShoppingCart,
  Settings,
  LogOut,
  Menu,
  X,
  User,
  Bell,
  Search,
  ChevronRight,
  Sparkles
} from 'lucide-react';

const Layout: React.FC = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [notifications] = useState(3); // 模拟通知数量
  const [currentRole, setCurrentRole] = useState<'admin' | 'owner' | 'bartender'>(user?.role || 'bartender');
  
  // 关闭侧边栏和用户菜单的效果
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (!target.closest('.sidebar') && !target.closest('.sidebar-toggle')) {
        setSidebarOpen(false);
      }
      if (!target.closest('.user-menu') && !target.closest('.user-menu-toggle')) {
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);
  
  // 键盘快捷键支持
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      // Ctrl/Cmd + K 打开搜索
      if ((event.ctrlKey || event.metaKey) && event.key === 'k') {
        event.preventDefault();
        const searchInput = document.querySelector('#global-search') as HTMLInputElement;
        searchInput?.focus();
      }
      // ESC 关闭侧边栏和菜单
      if (event.key === 'Escape') {
        setSidebarOpen(false);
        setShowUserMenu(false);
      }
    };
    
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, []);

  // 导航菜单项
  const navigationItems = [
    {
      name: '仪表板',
      href: '/dashboard',
      icon: BarChart3,
      description: '销售概览和关键指标'
    },
    {
      name: '配方管理',
      href: '/recipes',
      icon: Wine,
      description: '管理鸡尾酒配方'
    },
    {
      name: '订单处理',
      href: '/orders',
      icon: ShoppingCart,
      description: '处理客户订单'
    },
    {
      name: '库存管理',
      href: '/inventory',
      icon: Package,
      description: '管理原料库存'
    },
    {
      name: '数据报表',
      href: '/reports',
      icon: FileText,
      description: '查看分析报表'
    }
  ];

  // 处理登出
  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  // 检查当前路径是否激活
  const isActive = (path: string) => {
    return location.pathname === path;
  };

  // 处理角色切换
  const handleRoleChange = (newRole: 'admin' | 'owner' | 'bartender') => {
    setCurrentRole(newRole);
    // 这里可以添加角色切换的API调用
    console.log('角色切换到:', newRole);
  };

  // 获取角色显示名称
  const getRoleDisplayName = (role: 'admin' | 'owner' | 'bartender') => {
    switch (role) {
      case 'admin': return '系统管理员';
      case 'owner': return '店主';
      case 'bartender': return '员工';
      default: return '员工';
    }
  };

  // 获取角色徽章样式
  const getRoleBadgeClass = (role: 'admin' | 'owner' | 'bartender') => {
    switch (role) {
      case 'admin': return 'badge-error';
      case 'owner': return 'badge-primary';
      case 'bartender': return 'badge-gray';
      default: return 'badge-gray';
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* 移动端侧边栏遮罩 */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40 lg:hidden animate-fade-in"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* 侧边栏 */}
      <div className={`sidebar fixed inset-y-0 left-0 z-50 w-72 bg-white/95 backdrop-blur-xl shadow-2xl border-r border-gray-200/50 transform transition-all duration-300 ease-out lg:translate-x-0 ${
        sidebarOpen ? 'translate-x-0' : '-translate-x-full'
      }`}>
        <div className="flex flex-col h-full relative overflow-hidden">
          {/* 装饰性渐变背景 */}
          <div className="absolute inset-0 bg-gradient-to-b from-primary-50/30 to-transparent pointer-events-none" />
          <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-bl from-accent-100/40 to-transparent rounded-full blur-2xl pointer-events-none" />
          {/* Logo 区域 */}
          <div className="relative flex items-center justify-between h-18 px-6 border-b border-gray-200/50 bg-white/50">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-105">
                  <Wine className="w-7 h-7 text-white" />
                </div>
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-accent-500 rounded-full animate-pulse-soft" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-gradient flex items-center gap-2">
                  调酒师
                  <Sparkles className="w-4 h-4 text-accent-500" />
                </h1>
                <p className="text-sm text-gray-600 font-medium">酒吧管理系统</p>
              </div>
            </div>
            
            {/* 移动端关闭按钮 */}
            <button
              onClick={() => setSidebarOpen(false)}
              className="lg:hidden p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* 导航菜单 */}
          <nav className="relative flex-1 px-6 py-8 space-y-3 scrollbar-thin overflow-y-auto">
            {navigationItems.map((item, index) => {
              const Icon = item.icon;
              const active = isActive(item.href);
              
              return (
                <Link
                  key={item.name}
                  to={item.href}
                  onClick={() => setSidebarOpen(false)}
                  className={`relative flex items-center gap-4 px-4 py-4 rounded-2xl transition-all duration-200 group animate-slide-up ${
                    active
                      ? 'bg-gradient-to-r from-primary-500 to-primary-600 text-white shadow-medium hover:shadow-large transform hover:scale-[1.02]'
                      : 'text-gray-700 hover:bg-white/80 hover:shadow-soft hover:scale-[1.01]'
                  }`}
                  style={{ animationDelay: `${index * 50}ms` }}
                >
                  {/* 活跃状态的装饰线 */}
                  {active && (
                    <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-white rounded-r-full" />
                  )}
                  
                  <div className={`p-2 rounded-xl transition-all duration-200 ${
                    active 
                      ? 'bg-white/20 shadow-soft' 
                      : 'bg-gray-100 group-hover:bg-primary-100 group-hover:scale-110'
                  }`}>
                    <Icon className={`w-5 h-5 transition-all duration-200 ${
                      active 
                        ? 'text-white' 
                        : 'text-gray-600 group-hover:text-primary-600'
                    }`} />
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <p className={`font-semibold text-sm transition-colors duration-200 ${
                      active ? 'text-white' : 'text-gray-900 group-hover:text-primary-700'
                    }`}>
                      {item.name}
                    </p>
                    <p className={`text-xs mt-0.5 transition-colors duration-200 ${
                      active ? 'text-white/80' : 'text-gray-500 group-hover:text-primary-600'
                    }`}>
                      {item.description}
                    </p>
                  </div>
                  
                  {/* 箭头指示器 */}
                  <ChevronRight className={`w-4 h-4 transition-all duration-200 ${
                    active 
                      ? 'text-white transform translate-x-1' 
                      : 'text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1'
                  }`} />
                  
                  {/* 悬停时的光晕效果 */}
                  {!active && (
                    <div className="absolute inset-0 rounded-2xl bg-gradient-to-r from-primary-500/0 to-accent-500/0 group-hover:from-primary-500/5 group-hover:to-accent-500/5 transition-all duration-300" />
                  )}
                </Link>
              );
            })}
          </nav>

          {/* 用户信息区域 */}
          <div className="relative p-6 border-t border-gray-200/50 bg-white/50">
            <div className="flex items-center gap-4 p-4 bg-gradient-to-r from-gray-50/80 to-white/80 rounded-2xl shadow-soft hover:shadow-medium transition-all duration-200 hover:scale-[1.02] cursor-pointer group">
              <div className="relative">
                <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-200">
                  <User className="w-6 h-6 text-white" />
                </div>
                <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-success-500 border-2 border-white rounded-full" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">{user?.name}</p>
                <div className="flex items-center gap-2 mt-1">
                  <span className={`badge ${getRoleBadgeClass(currentRole)}`}>
                    {getRoleDisplayName(currentRole)}
                  </span>
                  <div className="status-online" />
                </div>
              </div>
              <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-primary-500 group-hover:translate-x-1 transition-all duration-200" />
            </div>
          </div>
        </div>
      </div>

      {/* 主内容区域 */}
      <div className="lg:ml-72 transition-all duration-300">
        {/* 顶部导航栏 */}
        <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-xl shadow-soft border-b border-gray-200/50">
          <div className="flex items-center justify-between h-18 px-6">
            {/* 左侧：移动端菜单按钮 */}
            <div className="flex items-center gap-6">
              <button
                onClick={() => setSidebarOpen(true)}
                className="sidebar-toggle lg:hidden p-2.5 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-xl transition-all duration-200 hover:scale-105"
              >
                <Menu className="w-5 h-5" />
              </button>
              
              {/* 面包屑导航 */}
              <div className="hidden sm:flex items-center gap-3">
                <div className="flex items-center gap-2 text-sm">
                  <span className="text-gray-500 font-medium">调酒师酒吧管理系统</span>
                  <ChevronRight className="w-4 h-4 text-gray-300" />
                  <span className="text-gray-900 font-semibold bg-gradient-to-r from-primary-600 to-accent-600 bg-clip-text text-transparent">
                    {navigationItems.find(item => isActive(item.href))?.name || '仪表板'}
                  </span>
                </div>
              </div>
            </div>

            {/* 右侧：搜索和用户菜单 */}
            <div className="flex items-center gap-4">
              {/* 搜索框 */}
              <div className="hidden md:flex relative group">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4 group-focus-within:text-primary-500 transition-colors duration-200" />
                <input
                  id="global-search"
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="搜索配方、订单或库存... (⌘K)"
                  className="pl-12 pr-4 py-3 border border-gray-300 rounded-2xl text-sm bg-gray-50/50 hover:bg-white focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary-500 focus:border-primary-500 transition-all duration-200 w-80 hover:shadow-soft focus:shadow-medium"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100 transition-all duration-200"
                  >
                    <X className="w-3 h-3" />
                  </button>
                )}
              </div>
              
              {/* 通知铃铛 */}
              <button className="relative p-3 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-105 group">
                <Bell className="w-5 h-5 group-hover:animate-bounce-soft" />
                {notifications > 0 && (
                  <>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse-soft">
                      {notifications > 9 ? '9+' : notifications}
                    </span>
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-error-500 rounded-full animate-ping" />
                  </>
                )}
              </button>
              
              {/* 用户菜单 */}
              <div className="relative user-menu">
                <button
                  onClick={() => setShowUserMenu(!showUserMenu)}
                  className="user-menu-toggle flex items-center gap-3 p-2 text-gray-700 hover:bg-gray-100 rounded-2xl transition-all duration-200 hover:scale-105 group"
                >
                  <div className="relative">
                    <div className="w-10 h-10 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft group-hover:shadow-medium transition-all duration-200">
                      <User className="w-5 h-5 text-white" />
                    </div>
                    <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-success-500 border-2 border-white rounded-full" />
                  </div>
                  <div className="hidden sm:block text-left">
                    <p className="text-sm font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">{user?.name}</p>
                    <p className="text-xs text-gray-500">{getRoleDisplayName(currentRole)}</p>
                  </div>
                  <ChevronRight className={`w-4 h-4 text-gray-400 transition-all duration-200 ${
                    showUserMenu ? 'rotate-90 text-primary-500' : 'group-hover:text-primary-500'
                  }`} />
                </button>
                
                {/* 用户下拉菜单 */}
                {showUserMenu && (
                  <div className="absolute right-0 mt-3 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-large border border-gray-200/50 py-3 z-50 animate-slide-down">
                    {/* 用户信息头部 */}
                    <div className="px-4 py-3 border-b border-gray-200/50">
                      <div className="flex items-center gap-3">
                        <div className="w-12 h-12 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl flex items-center justify-center shadow-soft">
                          <User className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <p className="font-semibold text-gray-900">{user?.name}</p>
                          <p className="text-sm text-gray-600">admin@bar.com</p>
                          <span className={`badge mt-1 ${getRoleBadgeClass(currentRole)}`}>
                            {getRoleDisplayName(currentRole)}
                          </span>
                        </div>
                      </div>
                    </div>
                    
                    {/* 菜单项 */}
                    <div className="py-2">
                      {/* 角色选择器 */}
                      <div className="px-4 py-3">
                        <label className="block text-xs font-medium text-gray-500 mb-2">
                          切换角色
                        </label>
                        <select
                          value={currentRole}
                          onChange={(e) => handleRoleChange(e.target.value as 'admin' | 'owner' | 'bartender')}
                          className="input-field min-w-[150px] text-sm"
                        >
                          <option value="bartender">员工</option>
                          <option value="owner">店主</option>
                          <option value="admin">系统管理员</option>
                        </select>
                      </div>
                      
                      <div className="divider my-2 mx-4" />
                      
                      {/* 系统设置 - 只有管理员可见 */}
                      {currentRole === 'admin' && (
                        <>
                          <button 
                            onClick={() => {
                              navigate('/settings');
                              setShowUserMenu(false);
                            }}
                            className="w-full flex items-center gap-3 px-4 py-3 text-left text-gray-700 hover:bg-gray-100/80 hover:text-primary-700 transition-all duration-200 group"
                          >
                            <div className="p-2 bg-gray-100 group-hover:bg-primary-100 rounded-xl transition-all duration-200">
                              <Settings className="w-4 h-4 group-hover:text-primary-600" />
                            </div>
                            <div>
                              <span className="font-medium">系统设置</span>
                              <p className="text-xs text-gray-500">管理系统配置</p>
                            </div>
                          </button>
                          
                          <div className="divider my-2 mx-4" />
                        </>
                      )}
                      
                      <button 
                        onClick={handleLogout}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left text-error-600 hover:bg-error-50 transition-all duration-200 group"
                      >
                        <div className="p-2 bg-error-100 group-hover:bg-error-200 rounded-xl transition-all duration-200">
                          <LogOut className="w-4 h-4" />
                        </div>
                        <div>
                          <span className="font-medium">退出登录</span>
                          <p className="text-xs text-error-500">安全退出系统</p>
                        </div>
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </header>

        {/* 页面内容 */}
        <main className="p-6 min-h-screen bg-gradient-to-br from-gray-50/50 to-white/50">
          <div className="animate-fade-in">
            <Outlet />
          </div>
        </main>
      </div>
    </div>
  );
};

export default Layout;