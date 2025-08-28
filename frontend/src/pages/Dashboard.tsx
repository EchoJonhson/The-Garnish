import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import {
  BarChart3,
  DollarSign,
  Package,
  AlertTriangle,
  TrendingUp,
  Wine,
  Clock
} from 'lucide-react';

// 模拟数据接口
interface DashboardStats {
  todaySales: {
    amount: number;
    orders: number;
    change: number;
  };
  inventory: {
    lowStock: number;
    totalProducts: number;
    warnings: Array<{
      id: number;
      name: string;
      brand: string;
      currentStock: number;
      warningLevel: number;
    }>;
  };
  topProducts: Array<{
    id: number;
    name: string;
    sales: number;
    revenue: number;
  }>;
  recentOrders: Array<{
    id: number;
    orderNumber: string;
    items: number;
    total: number;
    status: string;
    createdAt: string;
  }>;
}

const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // 模拟数据加载
  useEffect(() => {
    const loadDashboardData = async () => {
      setIsLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟数据
      const mockStats: DashboardStats = {
        todaySales: {
          amount: 2580,
          orders: 42,
          change: 12.5
        },
        inventory: {
          lowStock: 3,
          totalProducts: 24,
          warnings: [
            {
              id: 1,
              name: '朗姆酒',
              brand: 'Bacardi',
              currentStock: 1200,
              warningLevel: 1500
            },
            {
              id: 2,
              name: '柠檬汁',
              brand: '鲜榨',
              currentStock: 450,
              warningLevel: 500
            },
            {
              id: 3,
              name: '糖浆',
              brand: '自制',
              currentStock: 200,
              warningLevel: 250
            }
          ]
        },
        topProducts: [
          { id: 1, name: 'Mojito', sales: 15, revenue: 870 },
          { id: 2, name: 'Old Fashioned', sales: 12, revenue: 816 },
          { id: 3, name: 'Whiskey Sour', sales: 8, revenue: 480 }
        ],
        recentOrders: [
          {
            id: 1,
            orderNumber: 'ORD20241001',
            items: 2,
            total: 126,
            status: 'completed',
            createdAt: '2024-10-01 14:30'
          },
          {
            id: 2,
            orderNumber: 'ORD20241002',
            items: 1,
            total: 68,
            status: 'pending',
            createdAt: '2024-10-01 14:25'
          }
        ]
      };
      
      setStats(mockStats);
      setIsLoading(false);
    };

    loadDashboardData();
  }, []);

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in">
          <div className="loading-spinner mx-auto mb-6"></div>
          <div className="loading-dots mb-4">
            <div></div>
            <div></div>
            <div></div>
          </div>
          <p className="text-gray-600 font-medium">正在加载数据...</p>
        </div>
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center animate-fade-in">
          <div className="w-16 h-16 bg-error-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-error-500" />
          </div>
          <p className="text-gray-600 font-medium">数据加载失败</p>
          <button className="btn-primary btn-sm mt-4" onClick={() => window.location.reload()}>
            重新加载
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 animate-fade-in">
      {/* 欢迎信息 */}
      <div className="relative overflow-hidden bg-gradient-to-br from-primary-500 via-primary-600 to-accent-600 rounded-3xl px-6 py-6 text-white shadow-large hover:shadow-glow transition-all duration-300 hover:scale-[1.01]">
        {/* 装饰性背景元素 */}
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full blur-3xl -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-accent-400/20 rounded-full blur-2xl translate-y-24 -translate-x-24" />
        
        <div className="relative flex items-center justify-between gap-6">
          <div className="p-4 bg-white/20 rounded-3xl backdrop-blur-sm shadow-soft">
            <Wine className="w-12 h-12 text-white" />
          </div>
          <div className="flex-1">
            <h1 className="text-3xl font-bold mb-2 flex items-center gap-3">
              欢迎回来，{user?.name}！
              <div className="w-2 h-2 bg-accent-400 rounded-full animate-pulse-soft" />
            </h1>
            <p className="text-white/90 text-lg font-medium">
              今天是 {new Date().toLocaleDateString('zh-CN', { 
                year: 'numeric', 
                month: 'long', 
                day: 'numeric',
                weekday: 'long'
              })}
            </p>
            <div className="flex items-center gap-4 mt-4">
              <div className="flex items-center gap-2 text-white/80">
                <Clock className="w-4 h-4" />
                <span className="text-sm">{new Date().toLocaleTimeString('zh-CN', { hour: '2-digit', minute: '2-digit' })}</span>
              </div>
              <div className="status-online" />
              <span className="text-sm text-white/80">系统运行正常</span>
            </div>
          </div>
        </div>
      </div>

      {/* 统计卡片 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* 今日销售额 */}
        <div className="card-hover p-6 group animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-600">今日销售额</p>
                <div className="status-online" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">¥{stats.todaySales.amount.toLocaleString()}</p>
              <div className="flex items-center gap-2">
                <div className="flex items-center gap-1 px-2 py-1 bg-success-100 rounded-full">
                  <TrendingUp className="w-3 h-3 text-success-600" />
                  <span className="text-xs font-semibold text-success-600">+{stats.todaySales.change}%</span>
                </div>
                <span className="text-xs text-gray-500">较昨日</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-success-100 to-success-200 rounded-2xl group-hover:scale-110 transition-transform duration-200">
              <DollarSign className="w-8 h-8 text-success-600" />
            </div>
          </div>
        </div>

        {/* 今日订单 */}
        <div className="card-hover p-6 group animate-slide-up" style={{ animationDelay: '200ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-600">今日订单</p>
                <div className="status-online" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats.todaySales.orders}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-primary">笔订单</span>
                <span className="text-xs text-gray-500">进行中</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-primary-100 to-primary-200 rounded-2xl group-hover:scale-110 transition-transform duration-200">
              <BarChart3 className="w-8 h-8 text-primary-600" />
            </div>
          </div>
        </div>

        {/* 库存预警 */}
        <div className="card-hover p-6 group animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-600">库存预警</p>
                <div className="status-warning" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats.inventory.lowStock}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-warning">需补货</span>
                <span className="text-xs text-gray-500">项商品</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-warning-100 to-warning-200 rounded-2xl group-hover:scale-110 transition-transform duration-200">
              <AlertTriangle className="w-8 h-8 text-warning-600" />
            </div>
          </div>
        </div>

        {/* 总商品数 */}
        <div className="card-hover p-6 group animate-slide-up" style={{ animationDelay: '400ms' }}>
          <div className="flex items-center justify-between">
            <div className="flex-1">
              <div className="flex items-center gap-2 mb-2">
                <p className="text-sm font-semibold text-gray-600">库存商品</p>
                <div className="status-online" />
              </div>
              <p className="text-3xl font-bold text-gray-900 mb-2">{stats.inventory.totalProducts}</p>
              <div className="flex items-center gap-2">
                <span className="badge badge-gray">种商品</span>
                <span className="text-xs text-gray-500">总计</span>
              </div>
            </div>
            <div className="p-4 bg-gradient-to-br from-purple-100 to-purple-200 rounded-2xl group-hover:scale-110 transition-transform duration-200">
              <Package className="w-8 h-8 text-purple-600" />
            </div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* 库存预警详情 */}
        <div className="card-hover p-6 animate-slide-up" style={{ animationDelay: '500ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-warning-100 rounded-xl">
              <AlertTriangle className="w-6 h-6 text-warning-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">库存预警</h2>
              <p className="text-sm text-gray-600">需要及时补货的商品</p>
            </div>
          </div>
          <div className="space-y-4">
            {stats.inventory.warnings.map((item, index) => (
              <div key={item.id} className="group p-4 bg-gradient-to-r from-warning-50 to-orange-50 rounded-2xl border border-warning-200 hover:shadow-soft transition-all duration-200 hover:scale-[1.02]" style={{ animationDelay: `${600 + index * 100}ms` }}>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-3 h-3 bg-warning-500 rounded-full animate-pulse-soft" />
                    <div>
                      <p className="font-semibold text-gray-900">{item.name}</p>
                      <p className="text-sm text-gray-600">{item.brand}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 mb-1">
                      <span className="text-lg font-bold text-warning-600">{item.currentStock}ml</span>
                      <span className="text-sm text-gray-400">/</span>
                      <span className="text-sm text-gray-500">{item.warningLevel}ml</span>
                    </div>
                    <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-gradient-to-r from-warning-400 to-warning-500 rounded-full transition-all duration-500"
                        style={{ width: `${Math.min((item.currentStock / item.warningLevel) * 100, 100)}%` }}
                      />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 热销产品 */}
        <div className="card-hover p-6 animate-slide-up" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-success-100 rounded-xl">
              <TrendingUp className="w-6 h-6 text-success-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">今日热销</h2>
              <p className="text-sm text-gray-600">销量排行榜</p>
            </div>
          </div>
          <div className="space-y-4">
            {stats.topProducts.map((product, index) => (
              <div key={product.id} className="group flex items-center justify-between p-4 bg-gradient-to-r from-gray-50 to-white rounded-2xl border border-gray-100 hover:shadow-soft transition-all duration-200 hover:scale-[1.02]" style={{ animationDelay: `${700 + index * 100}ms` }}>
                <div className="flex items-center gap-4">
                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center text-sm font-bold text-white shadow-soft ${
                    index === 0 ? 'bg-gradient-to-br from-accent-400 to-accent-500' :
                    index === 1 ? 'bg-gradient-to-br from-gray-400 to-gray-500' :
                    'bg-gradient-to-br from-orange-400 to-orange-500'
                  }`}>
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-semibold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">{product.name}</p>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="badge badge-success">{product.sales} 杯</span>
                      <span className="text-xs text-gray-500">已售出</span>
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-lg font-bold text-gray-900">¥{product.revenue.toLocaleString()}</p>
                  <p className="text-xs text-gray-500">销售额</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 最近订单 */}
      <div className="card-hover p-6 animate-slide-up" style={{ animationDelay: '700ms' }}>
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-xl">
              <Clock className="w-6 h-6 text-primary-600" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-900">最近订单</h2>
              <p className="text-sm text-gray-600">实时订单动态</p>
            </div>
          </div>
          <button className="btn-secondary text-sm px-4 py-2 hover:scale-105 transition-transform duration-200">
            查看全部
          </button>
        </div>
        <div className="overflow-hidden rounded-2xl border border-gray-100">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="bg-gradient-to-r from-gray-50 to-gray-100 border-b border-gray-200">
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">订单号</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">时间</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">商品</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">金额</th>
                  <th className="text-left py-4 px-6 font-semibold text-gray-700">状态</th>
                </tr>
              </thead>
              <tbody>
                {stats.recentOrders.map((order, index) => (
                  <tr key={order.id} className="group border-b border-gray-50 hover:bg-gradient-to-r hover:from-primary-25 hover:to-transparent transition-all duration-200" style={{ animationDelay: `${800 + index * 100}ms` }}>
                    <td className="py-4 px-6">
                      <span className="font-semibold text-primary-700 group-hover:text-primary-800 transition-colors duration-200">{order.orderNumber}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{order.createdAt}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="text-gray-600 group-hover:text-gray-700 transition-colors duration-200">{order.items} 项</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className="font-bold text-gray-900 group-hover:text-primary-700 transition-colors duration-200">¥{order.total.toLocaleString()}</span>
                    </td>
                    <td className="py-4 px-6">
                      <span className={`px-3 py-1.5 rounded-full text-xs font-semibold shadow-soft transition-all duration-200 group-hover:scale-105 ${
                        order.status === 'completed' ? 'bg-gradient-to-r from-success-100 to-success-200 text-success-800 border border-success-300' :
                        order.status === 'pending' ? 'bg-gradient-to-r from-warning-100 to-warning-200 text-warning-800 border border-warning-300' :
                        'bg-gradient-to-r from-primary-100 to-primary-200 text-primary-800 border border-primary-300'
                      }`}>
                        {order.status === 'completed' ? '已完成' : '进行中'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;