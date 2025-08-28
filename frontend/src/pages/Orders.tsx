import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Clock,
  CheckCircle,
  AlertTriangle,
  DollarSign,
  User,
  Calendar,
  RefreshCw,
  Eye,
  X,
  Wine,
  Package
} from 'lucide-react';

// 订单接口定义
interface OrderItem {
  id: number;
  recipeId: number;
  recipeName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
  substitutions?: Array<{
    originalIngredient: string;
    substituteIngredient: string;
    costDifference: number;
  }>;
  status: 'pending' | 'preparing' | 'completed';
}

interface Order {
  id: number;
  orderNumber: string;
  customerName?: string;
  tableNumber?: string;
  items: OrderItem[];
  subtotal: number;
  tax: number;
  total: number;
  status: 'pending' | 'preparing' | 'completed' | 'cancelled';
  paymentStatus: 'unpaid' | 'paid' | 'refunded';
  createdAt: string;
  updatedAt: string;
  completedAt?: string;
  notes?: string;
}

const Orders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [_showCreateModal, setShowCreateModal] = useState(false);

  // 模拟数据
  useEffect(() => {
    const loadOrders = async () => {
      setIsLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockOrders: Order[] = [
        {
          id: 1,
          orderNumber: 'ORD20241001001',
          customerName: '张先生',
          tableNumber: 'A03',
          items: [
            {
              id: 1,
              recipeId: 1,
              recipeName: 'Mojito',
              quantity: 2,
              unitPrice: 58,
              totalPrice: 116,
              status: 'completed'
            },
            {
              id: 2,
              recipeId: 2,
              recipeName: 'Old Fashioned',
              quantity: 1,
              unitPrice: 68,
              totalPrice: 68,
              substitutions: [
                {
                  originalIngredient: 'Buffalo Trace 波本威士忌',
                  substituteIngredient: 'Maker\'s Mark 波本威士忌',
                  costDifference: 8
                }
              ],
              status: 'completed'
            }
          ],
          subtotal: 184,
          tax: 18.4,
          total: 202.4,
          status: 'completed',
          paymentStatus: 'paid',
          createdAt: '2024-10-01 14:30:00',
          updatedAt: '2024-10-01 14:45:00',
          completedAt: '2024-10-01 14:45:00',
          notes: '客人要求少冰'
        },
        {
          id: 2,
          orderNumber: 'ORD20241001002',
          customerName: '李女士',
          tableNumber: 'B05',
          items: [
            {
              id: 3,
              recipeId: 3,
              recipeName: 'Whiskey Sour',
              quantity: 1,
              unitPrice: 60,
              totalPrice: 60,
              status: 'preparing'
            },
            {
              id: 4,
              recipeId: 1,
              recipeName: 'Mojito',
              quantity: 1,
              unitPrice: 58,
              totalPrice: 58,
              status: 'pending'
            }
          ],
          subtotal: 118,
          tax: 11.8,
          total: 129.8,
          status: 'preparing',
          paymentStatus: 'unpaid',
          createdAt: '2024-10-01 15:15:00',
          updatedAt: '2024-10-01 15:20:00'
        },
        {
          id: 3,
          orderNumber: 'ORD20241001003',
          tableNumber: 'C02',
          items: [
            {
              id: 5,
              recipeId: 2,
              recipeName: 'Old Fashioned',
              quantity: 2,
              unitPrice: 68,
              totalPrice: 136,
              status: 'pending'
            }
          ],
          subtotal: 136,
          tax: 13.6,
          total: 149.6,
          status: 'pending',
          paymentStatus: 'unpaid',
          createdAt: '2024-10-01 15:45:00',
          updatedAt: '2024-10-01 15:45:00',
          notes: '需要确认威士忌品牌'
        }
      ];
      
      setOrders(mockOrders);
      setIsLoading(false);
    };

    loadOrders();
  }, []);

  // 过滤订单
  const filteredOrders = orders.filter(order => {
    const matchesSearch = order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         (order.customerName && order.customerName.toLowerCase().includes(searchTerm.toLowerCase())) ||
                         (order.tableNumber && order.tableNumber.toLowerCase().includes(searchTerm.toLowerCase()));
    const matchesStatus = statusFilter === 'all' || order.status === statusFilter;
    const matchesPayment = paymentFilter === 'all' || order.paymentStatus === paymentFilter;
    return matchesSearch && matchesStatus && matchesPayment;
  });

  // 状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'preparing':
        return 'bg-blue-100 text-blue-800';
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 支付状态样式
  const getPaymentStatusStyle = (status: string) => {
    switch (status) {
      case 'paid':
        return 'bg-green-100 text-green-800';
      case 'unpaid':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending':
        return '待处理';
      case 'preparing':
        return '制作中';
      case 'completed':
        return '已完成';
      case 'cancelled':
        return '已取消';
      default:
        return '未知';
    }
  };

  // 支付状态文本
  const getPaymentStatusText = (status: string) => {
    switch (status) {
      case 'paid':
        return '已支付';
      case 'unpaid':
        return '未支付';
      case 'refunded':
        return '已退款';
      default:
        return '未知';
    }
  };

  // 更新订单状态
  const updateOrderStatus = (orderId: number, newStatus: string) => {
    setOrders(orders.map(order => 
      order.id === orderId 
        ? { ...order, status: newStatus as any, updatedAt: new Date().toISOString() }
        : order
    ));
  };

  // 更新订单项状态
  const updateOrderItemStatus = (orderId: number, itemId: number, newStatus: string) => {
    setOrders(orders.map(order => {
      if (order.id === orderId) {
        const updatedItems = order.items.map(item => 
          item.id === itemId ? { ...item, status: newStatus as any } : item
        );
        
        // 检查是否所有项目都已完成
        const allCompleted = updatedItems.every(item => item.status === 'completed');
        const orderStatus = allCompleted ? 'completed' : 
                           updatedItems.some(item => item.status === 'preparing') ? 'preparing' : 'pending';
        
        return {
          ...order,
          items: updatedItems,
          status: orderStatus as any,
          updatedAt: new Date().toISOString(),
          completedAt: allCompleted ? new Date().toISOString() : order.completedAt
        };
      }
      return order;
    }));
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载订单中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">订单管理</h1>
          <p className="text-gray-600">管理所有订单和制作进度</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            新建订单
          </button>
        </div>
      </div>

      {/* 搜索和筛选 */}
      <div className="card p-6">
        <div className="flex flex-col lg:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索订单号、客户名或桌号..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          {/* 状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="all">全部状态</option>
            <option value="pending">待处理</option>
            <option value="preparing">制作中</option>
            <option value="completed">已完成</option>
            <option value="cancelled">已取消</option>
          </select>
          
          {/* 支付状态筛选 */}
          <select
            value={paymentFilter}
            onChange={(e) => setPaymentFilter(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="all">全部支付</option>
            <option value="paid">已支付</option>
            <option value="unpaid">未支付</option>
            <option value="refunded">已退款</option>
          </select>
        </div>
      </div>

      {/* 订单统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <Clock className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">待处理</p>
              <p className="text-xl font-bold">{orders.filter(o => o.status === 'pending').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-blue-100 rounded-lg">
              <RefreshCw className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">制作中</p>
              <p className="text-xl font-bold">{orders.filter(o => o.status === 'preparing').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">已完成</p>
              <p className="text-xl font-bold">{orders.filter(o => o.status === 'completed').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <DollarSign className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">今日营业额</p>
              <p className="text-xl font-bold">¥{orders.filter(o => o.status === 'completed').reduce((sum, o) => sum + o.total, 0).toFixed(0)}</p>
            </div>
          </div>
        </div>
      </div>

      {/* 订单列表 */}
      <div className="space-y-4">
        {filteredOrders.map((order) => (
          <div key={order.id} className="card p-6">
            {/* 订单头部 */}
            <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-4">
              <div className="flex items-center gap-4">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900">{order.orderNumber}</h3>
                  <div className="flex items-center gap-4 text-sm text-gray-600">
                    {order.customerName && (
                      <div className="flex items-center gap-1">
                        <User className="w-4 h-4" />
                        <span>{order.customerName}</span>
                      </div>
                    )}
                    {order.tableNumber && (
                      <div className="flex items-center gap-1">
                        <Package className="w-4 h-4" />
                        <span>桌号: {order.tableNumber}</span>
                      </div>
                    )}
                    <div className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      <span>{new Date(order.createdAt).toLocaleString('zh-CN')}</span>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getStatusStyle(order.status)}`}>
                  {getStatusText(order.status)}
                </span>
                <span className={`px-3 py-1 rounded-full text-sm font-medium ${getPaymentStatusStyle(order.paymentStatus)}`}>
                  {getPaymentStatusText(order.paymentStatus)}
                </span>
                <span className="text-lg font-bold text-gray-900">¥{order.total}</span>
              </div>
            </div>

            {/* 订单项目 */}
            <div className="space-y-3 mb-4">
              {order.items.map((item) => (
                <div key={item.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div className="flex items-center gap-3">
                    <Wine className="w-5 h-5 text-primary-500" />
                    <div>
                      <p className="font-medium text-gray-900">{item.recipeName}</p>
                      <p className="text-sm text-gray-600">数量: {item.quantity} × ¥{item.unitPrice}</p>
                      {item.substitutions && item.substitutions.length > 0 && (
                        <div className="mt-1">
                          <p className="text-xs text-orange-600">替换原料:</p>
                          {item.substitutions.map((sub, index) => (
                            <p key={index} className="text-xs text-gray-600">
                              {sub.originalIngredient} → {sub.substituteIngredient} (+¥{sub.costDifference})
                            </p>
                          ))}
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <div className="flex items-center gap-3">
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                      {getStatusText(item.status)}
                    </span>
                    <span className="font-medium">¥{item.totalPrice}</span>
                    
                    {/* 快速操作按钮 */}
                    {item.status === 'pending' && (
                      <button
                        onClick={() => updateOrderItemStatus(order.id, item.id, 'preparing')}
                        className="px-2 py-1 bg-blue-500 text-white text-xs rounded hover:bg-blue-600 transition-colors"
                      >
                        开始制作
                      </button>
                    )}
                    {item.status === 'preparing' && (
                      <button
                        onClick={() => updateOrderItemStatus(order.id, item.id, 'completed')}
                        className="px-2 py-1 bg-green-500 text-white text-xs rounded hover:bg-green-600 transition-colors"
                      >
                        完成
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>

            {/* 备注 */}
            {order.notes && (
              <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">备注:</span>
                </div>
                <p className="text-sm text-yellow-700 mt-1">{order.notes}</p>
              </div>
            )}

            {/* 订单操作 */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
              <div className="text-sm text-gray-600">
                小计: ¥{order.subtotal} | 税费: ¥{order.tax} | 总计: ¥{order.total}
              </div>
              
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedOrder(order);
                    setShowDetailModal(true);
                  }}
                  className="btn-secondary text-sm flex items-center gap-1"
                >
                  <Eye className="w-4 h-4" />
                  查看详情
                </button>
                
                {order.status === 'pending' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'preparing')}
                    className="px-3 py-1 bg-blue-500 text-white text-sm rounded hover:bg-blue-600 transition-colors"
                  >
                    开始制作
                  </button>
                )}
                
                {order.status === 'preparing' && (
                  <button
                    onClick={() => updateOrderStatus(order.id, 'completed')}
                    className="px-3 py-1 bg-green-500 text-white text-sm rounded hover:bg-green-600 transition-colors"
                  >
                    完成订单
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* 空状态 */}
      {filteredOrders.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到订单</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索条件或创建新的订单</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            创建第一个订单
          </button>
        </div>
      )}

      {/* 订单详情模态框 */}
      {showDetailModal && selectedOrder && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 模态框头部 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">订单详情</h2>
                  <p className="text-gray-600">{selectedOrder.orderNumber}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 订单信息 */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">客户信息</p>
                    <p className="font-medium">{selectedOrder.customerName || '未提供'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">桌号</p>
                    <p className="font-medium">{selectedOrder.tableNumber || '未指定'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">订单状态</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getStatusStyle(selectedOrder.status)}`}>
                      {getStatusText(selectedOrder.status)}
                    </span>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">支付状态</p>
                    <span className={`inline-block px-2 py-1 rounded-full text-sm font-medium ${getPaymentStatusStyle(selectedOrder.paymentStatus)}`}>
                      {getPaymentStatusText(selectedOrder.paymentStatus)}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">创建时间</p>
                    <p className="font-medium">{new Date(selectedOrder.createdAt).toLocaleString('zh-CN')}</p>
                  </div>
                  {selectedOrder.completedAt && (
                    <div>
                      <p className="text-sm text-gray-600">完成时间</p>
                      <p className="font-medium">{new Date(selectedOrder.completedAt).toLocaleString('zh-CN')}</p>
                    </div>
                  )}
                </div>
              </div>

              {/* 订单项目详情 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">订单项目</h3>
                <div className="space-y-3">
                  {selectedOrder.items.map((item) => (
                    <div key={item.id} className="p-4 border border-gray-200 rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center gap-3">
                          <Wine className="w-5 h-5 text-primary-500" />
                          <div>
                            <p className="font-medium text-gray-900">{item.recipeName}</p>
                            <p className="text-sm text-gray-600">数量: {item.quantity} × ¥{item.unitPrice} = ¥{item.totalPrice}</p>
                          </div>
                        </div>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                          {getStatusText(item.status)}
                        </span>
                      </div>
                      
                      {item.substitutions && item.substitutions.length > 0 && (
                        <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                          <p className="text-sm font-medium text-orange-800 mb-2">原料替换:</p>
                          {item.substitutions.map((sub, index) => (
                            <div key={index} className="text-sm text-orange-700">
                              <p><strong>原料:</strong> {sub.originalIngredient}</p>
                              <p><strong>替换为:</strong> {sub.substituteIngredient}</p>
                              <p><strong>成本差异:</strong> +¥{sub.costDifference}</p>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* 费用明细 */}
              <div className="border-t border-gray-200 pt-4">
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">小计</span>
                    <span>¥{selectedOrder.subtotal}</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-600">税费 (10%)</span>
                    <span>¥{selectedOrder.tax}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t border-gray-200 pt-2">
                    <span>总计</span>
                    <span>¥{selectedOrder.total}</span>
                  </div>
                </div>
              </div>

              {/* 备注 */}
              {selectedOrder.notes && (
                <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                  <p className="text-sm font-medium text-yellow-800 mb-1">备注:</p>
                  <p className="text-sm text-yellow-700">{selectedOrder.notes}</p>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Orders;