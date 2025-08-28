import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Navigate } from 'react-router-dom';
import {
  Settings as SettingsIcon,
  User,
  Shield,
  Database,
  Bell,
  Palette,
  Globe,
  Save,
  RefreshCw,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';

const Settings: React.FC = () => {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState('general');
  const [settings, setSettings] = useState({
    // 通用设置
    siteName: '调酒师酒吧管理系统',
    language: 'zh-CN',
    timezone: 'Asia/Shanghai',
    currency: 'CNY',
    
    // 用户管理
    allowRegistration: false,
    requireEmailVerification: true,
    passwordMinLength: 8,
    sessionTimeout: 30,
    
    // 系统安全
    enableTwoFactor: false,
    loginAttempts: 5,
    lockoutDuration: 15,
    enableAuditLog: true,
    
    // 通知设置
    emailNotifications: true,
    pushNotifications: false,
    lowStockAlert: true,
    orderNotifications: true,
    
    // 数据库设置
    autoBackup: true,
    backupFrequency: 'daily',
    retentionDays: 30,
    
    // 界面设置
    theme: 'light',
    compactMode: false,
    showAnimations: true
  });
  
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'success' | 'error'>('idle');

  // 权限检查：只有管理员可以访问
  if (user?.role !== 'admin') {
    return <Navigate to="/dashboard" replace />;
  }

  const handleSettingChange = (key: string, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaveStatus('saving');
    try {
      // 模拟保存操作
      await new Promise(resolve => setTimeout(resolve, 1000));
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 2000);
    } catch (error) {
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 2000);
    }
  };

  const tabs = [
    { id: 'general', name: '通用设置', icon: SettingsIcon },
    { id: 'users', name: '用户管理', icon: User },
    { id: 'security', name: '安全设置', icon: Shield },
    { id: 'notifications', name: '通知设置', icon: Bell },
    { id: 'database', name: '数据库', icon: Database },
    { id: 'appearance', name: '界面设置', icon: Palette }
  ];

  const renderTabContent = () => {
    switch (activeTab) {
      case 'general':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  系统名称
                </label>
                <input
                  type="text"
                  value={settings.siteName}
                  onChange={(e) => handleSettingChange('siteName', e.target.value)}
                  className="input-field"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  语言
                </label>
                <select
                  value={settings.language}
                  onChange={(e) => handleSettingChange('language', e.target.value)}
                  className="input-field"
                >
                  <option value="zh-CN">简体中文</option>
                  <option value="en-US">English</option>
                  <option value="ja-JP">日本語</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  时区
                </label>
                <select
                  value={settings.timezone}
                  onChange={(e) => handleSettingChange('timezone', e.target.value)}
                  className="input-field"
                >
                  <option value="Asia/Shanghai">Asia/Shanghai (UTC+8)</option>
                  <option value="America/New_York">America/New_York (UTC-5)</option>
                  <option value="Europe/London">Europe/London (UTC+0)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  货币
                </label>
                <select
                  value={settings.currency}
                  onChange={(e) => handleSettingChange('currency', e.target.value)}
                  className="input-field"
                >
                  <option value="CNY">人民币 (¥)</option>
                  <option value="USD">美元 ($)</option>
                  <option value="EUR">欧元 (€)</option>
                </select>
              </div>
            </div>
          </div>
        );

      case 'users':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">允许用户注册</h4>
                  <p className="text-sm text-gray-500">允许新用户自主注册账户</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.allowRegistration}
                    onChange={(e) => handleSettingChange('allowRegistration', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">邮箱验证</h4>
                  <p className="text-sm text-gray-500">要求用户验证邮箱地址</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.requireEmailVerification}
                    onChange={(e) => handleSettingChange('requireEmailVerification', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  密码最小长度
                </label>
                <input
                  type="number"
                  min="6"
                  max="20"
                  value={settings.passwordMinLength}
                  onChange={(e) => handleSettingChange('passwordMinLength', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  会话超时时间（分钟）
                </label>
                <input
                  type="number"
                  min="5"
                  max="480"
                  value={settings.sessionTimeout}
                  onChange={(e) => handleSettingChange('sessionTimeout', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      case 'security':
        return (
          <div className="space-y-6">
            <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
              <div className="flex items-center">
                <AlertTriangle className="w-5 h-5 text-yellow-600 mr-2" />
                <h4 className="font-medium text-yellow-800">安全提醒</h4>
              </div>
              <p className="text-sm text-yellow-700 mt-1">
                修改安全设置可能会影响系统的安全性，请谨慎操作。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">启用双因素认证</h4>
                  <p className="text-sm text-gray-500">为管理员账户启用2FA</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableTwoFactor}
                    onChange={(e) => handleSettingChange('enableTwoFactor', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">启用审计日志</h4>
                  <p className="text-sm text-gray-500">记录系统操作日志</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.enableAuditLog}
                    onChange={(e) => handleSettingChange('enableAuditLog', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  登录尝试次数限制
                </label>
                <input
                  type="number"
                  min="3"
                  max="10"
                  value={settings.loginAttempts}
                  onChange={(e) => handleSettingChange('loginAttempts', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  账户锁定时间（分钟）
                </label>
                <input
                  type="number"
                  min="5"
                  max="60"
                  value={settings.lockoutDuration}
                  onChange={(e) => handleSettingChange('lockoutDuration', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
            </div>
          </div>
        );

      case 'notifications':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">邮件通知</h4>
                  <p className="text-sm text-gray-500">通过邮件发送系统通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.emailNotifications}
                    onChange={(e) => handleSettingChange('emailNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">推送通知</h4>
                  <p className="text-sm text-gray-500">浏览器推送通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.pushNotifications}
                    onChange={(e) => handleSettingChange('pushNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">库存预警</h4>
                  <p className="text-sm text-gray-500">库存不足时发送通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.lowStockAlert}
                    onChange={(e) => handleSettingChange('lowStockAlert', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">订单通知</h4>
                  <p className="text-sm text-gray-500">新订单和订单状态变更通知</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.orderNotifications}
                    onChange={(e) => handleSettingChange('orderNotifications', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      case 'database':
        return (
          <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center">
                <Database className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-medium text-blue-800">数据库管理</h4>
              </div>
              <p className="text-sm text-blue-700 mt-1">
                数据库设置影响系统性能和数据安全，请谨慎修改。
              </p>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">自动备份</h4>
                  <p className="text-sm text-gray-500">定期自动备份数据库</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoBackup}
                    onChange={(e) => handleSettingChange('autoBackup', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备份频率
                </label>
                <select
                  value={settings.backupFrequency}
                  onChange={(e) => handleSettingChange('backupFrequency', e.target.value)}
                  className="input-field"
                  disabled={!settings.autoBackup}
                >
                  <option value="hourly">每小时</option>
                  <option value="daily">每天</option>
                  <option value="weekly">每周</option>
                  <option value="monthly">每月</option>
                </select>
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  备份保留天数
                </label>
                <input
                  type="number"
                  min="7"
                  max="365"
                  value={settings.retentionDays}
                  onChange={(e) => handleSettingChange('retentionDays', parseInt(e.target.value))}
                  className="input-field"
                />
              </div>
              
              <div className="md:col-span-2">
                <div className="flex gap-4">
                  <button className="btn-secondary flex items-center gap-2">
                    <Database className="w-4 h-4" />
                    立即备份
                  </button>
                  <button className="btn-secondary flex items-center gap-2">
                    <RefreshCw className="w-4 h-4" />
                    恢复备份
                  </button>
                </div>
              </div>
            </div>
          </div>
        );

      case 'appearance':
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  主题
                </label>
                <select
                  value={settings.theme}
                  onChange={(e) => handleSettingChange('theme', e.target.value)}
                  className="input-field"
                >
                  <option value="light">浅色主题</option>
                  <option value="dark">深色主题</option>
                  <option value="auto">跟随系统</option>
                </select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">紧凑模式</h4>
                  <p className="text-sm text-gray-500">减少界面间距，显示更多内容</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.compactMode}
                    onChange={(e) => handleSettingChange('compactMode', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">显示动画</h4>
                  <p className="text-sm text-gray-500">启用界面过渡动画效果</p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.showAnimations}
                    onChange={(e) => handleSettingChange('showAnimations', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
                </label>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* 页面头部 */}
      <div className="bg-white shadow-soft border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="p-3 bg-gradient-to-br from-primary-500 to-primary-600 rounded-2xl shadow-soft">
              <SettingsIcon className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-gray-900">系统设置</h1>
              <p className="text-gray-600">管理系统配置和偏好设置</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* 侧边栏导航 */}
          <div className="lg:w-64 flex-shrink-0">
            <nav className="space-y-2">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                      isActive
                        ? 'bg-primary-500 text-white shadow-medium'
                        : 'text-gray-700 hover:bg-gray-100 hover:text-primary-600'
                    }`}
                  >
                    <Icon className={`w-5 h-5 ${
                      isActive ? 'text-white' : 'text-gray-500'
                    }`} />
                    <span className="font-medium">{tab.name}</span>
                  </button>
                );
              })}
            </nav>
          </div>

          {/* 主要内容区域 */}
          <div className="flex-1">
            <div className="bg-white rounded-2xl shadow-soft border border-gray-100">
              <div className="p-6 border-b border-gray-200">
                <h2 className="text-xl font-semibold text-gray-900">
                  {tabs.find(tab => tab.id === activeTab)?.name}
                </h2>
              </div>
              
              <div className="p-6">
                {renderTabContent()}
              </div>
              
              {/* 保存按钮 */}
              <div className="px-6 py-4 bg-gray-50 border-t border-gray-200 rounded-b-2xl">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    {saveStatus === 'success' && (
                      <>
                        <CheckCircle className="w-5 h-5 text-success-500" />
                        <span className="text-sm text-success-600">设置已保存</span>
                      </>
                    )}
                    {saveStatus === 'error' && (
                      <>
                        <AlertTriangle className="w-5 h-5 text-error-500" />
                        <span className="text-sm text-error-600">保存失败，请重试</span>
                      </>
                    )}
                  </div>
                  
                  <button
                    onClick={handleSave}
                    disabled={saveStatus === 'saving'}
                    className="btn-primary flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {saveStatus === 'saving' ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Save className="w-4 h-4" />
                    )}
                    {saveStatus === 'saving' ? '保存中...' : '保存设置'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Settings;