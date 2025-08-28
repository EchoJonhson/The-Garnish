import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  AlertTriangle,
  Package,
  TrendingDown,
  TrendingUp,
  Edit,
  Eye,
  X,
  BarChart3,
  RefreshCw
} from 'lucide-react';

// 库存接口定义
interface InventoryItem {
  id: number;
  name: string;
  brand: string;
  category: string;
  unit: string;
  currentStock: number;
  warningLevel: number;
  criticalLevel: number;
  unitCost: number;
  totalValue: number;
  supplier: string;
  lastRestocked: string;
  expiryDate?: string;
  location: string;
  status: 'in_stock' | 'low_stock' | 'critical' | 'out_of_stock';
  usageHistory: Array<{
    date: string;
    type: 'usage' | 'restock' | 'adjustment';
    amount: number;
    reason: string;
    orderId?: number;
  }>;
}

const Inventory: React.FC = () => {
  const [inventory, setInventory] = useState<InventoryItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedItem, setSelectedItem] = useState<InventoryItem | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showAdjustModal, setShowAdjustModal] = useState(false);
  const [adjustmentAmount, setAdjustmentAmount] = useState('');
  const [adjustmentReason, setAdjustmentReason] = useState('');

  // 模拟数据
  useEffect(() => {
    const loadInventory = async () => {
      setIsLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 800));
      
      const mockInventory: InventoryItem[] = [
        {
          id: 1,
          name: '白朗姆酒',
          brand: 'Bacardi',
          category: '烈酒',
          unit: 'ml',
          currentStock: 1200,
          warningLevel: 1500,
          criticalLevel: 500,
          unitCost: 0.24,
          totalValue: 288,
          supplier: '酒类批发商A',
          lastRestocked: '2024-09-25',
          location: 'A区-1层-3号',
          status: 'low_stock',
          usageHistory: [
            {
              date: '2024-10-01',
              type: 'usage',
              amount: -150,
              reason: '制作Mojito',
              orderId: 1
            },
            {
              date: '2024-09-30',
              type: 'usage',
              amount: -100,
              reason: '制作Mojito',
              orderId: 2
            },
            {
              date: '2024-09-25',
              type: 'restock',
              amount: 2000,
              reason: '定期补货'
            }
          ]
        },
        {
          id: 2,
          name: '波本威士忌',
          brand: 'Buffalo Trace',
          category: '烈酒',
          unit: 'ml',
          currentStock: 0,
          warningLevel: 800,
          criticalLevel: 200,
          unitCost: 0.45,
          totalValue: 0,
          supplier: '威士忌专营店',
          lastRestocked: '2024-09-15',
          location: 'A区-2层-1号',
          status: 'out_of_stock',
          usageHistory: [
            {
              date: '2024-09-30',
              type: 'usage',
              amount: -120,
              reason: '制作Old Fashioned',
              orderId: 3
            },
            {
              date: '2024-09-28',
              type: 'usage',
              amount: -180,
              reason: '制作Old Fashioned',
              orderId: 4
            }
          ]
        },
        {
          id: 3,
          name: '波本威士忌',
          brand: 'Maker\'s Mark',
          category: '烈酒',
          unit: 'ml',
          currentStock: 1800,
          warningLevel: 800,
          criticalLevel: 200,
          unitCost: 0.52,
          totalValue: 936,
          supplier: '威士忌专营店',
          lastRestocked: '2024-09-28',
          location: 'A区-2层-2号',
          status: 'in_stock',
          usageHistory: [
            {
              date: '2024-10-01',
              type: 'usage',
              amount: -60,
              reason: '替代Buffalo Trace制作Old Fashioned',
              orderId: 1
            },
            {
              date: '2024-09-28',
              type: 'restock',
              amount: 1500,
              reason: '定期补货'
            }
          ]
        },
        {
          id: 4,
          name: '柠檬汁',
          brand: '鲜榨',
          category: '果汁',
          unit: 'ml',
          currentStock: 450,
          warningLevel: 500,
          criticalLevel: 100,
          unitCost: 0.08,
          totalValue: 36,
          supplier: '本地果汁供应商',
          lastRestocked: '2024-10-01',
          expiryDate: '2024-10-03',
          location: 'B区-冷藏-1号',
          status: 'low_stock',
          usageHistory: [
            {
              date: '2024-10-01',
              type: 'usage',
              amount: -50,
              reason: '制作Whiskey Sour',
              orderId: 2
            },
            {
              date: '2024-10-01',
              type: 'restock',
              amount: 500,
              reason: '每日新鲜补货'
            }
          ]
        },
        {
          id: 5,
          name: '糖浆',
          brand: '自制',
          category: '调料',
          unit: 'ml',
          currentStock: 200,
          warningLevel: 250,
          criticalLevel: 50,
          unitCost: 0.05,
          totalValue: 10,
          supplier: '自制',
          lastRestocked: '2024-09-30',
          location: 'C区-常温-1号',
          status: 'critical',
          usageHistory: [
            {
              date: '2024-10-01',
              type: 'usage',
              amount: -30,
              reason: '制作Old Fashioned和Whiskey Sour',
              orderId: 1
            },
            {
              date: '2024-09-30',
              type: 'restock',
              amount: 300,
              reason: '自制补充'
            }
          ]
        },
        {
          id: 6,
          name: '新鲜薄荷叶',
          brand: '本地采购',
          category: '香草',
          unit: '片',
          currentStock: 150,
          warningLevel: 100,
          criticalLevel: 20,
          unitCost: 0.2,
          totalValue: 30,
          supplier: '本地农场',
          lastRestocked: '2024-10-01',
          expiryDate: '2024-10-04',
          location: 'B区-冷藏-2号',
          status: 'in_stock',
          usageHistory: [
            {
              date: '2024-10-01',
              type: 'usage',
              amount: -30,
              reason: '制作Mojito',
              orderId: 1
            },
            {
              date: '2024-10-01',
              type: 'restock',
              amount: 200,
              reason: '每日新鲜补货'
            }
          ]
        }
      ];
      
      setInventory(mockInventory);
      setIsLoading(false);
    };

    loadInventory();
  }, []);

  // 过滤库存
  const filteredInventory = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.brand.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         item.supplier.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.category === categoryFilter;
    const matchesStatus = statusFilter === 'all' || item.status === statusFilter;
    return matchesSearch && matchesCategory && matchesStatus;
  });

  // 获取所有分类
  const categories = ['all', ...Array.from(new Set(inventory.map(item => item.category)))];

  // 状态样式
  const getStatusStyle = (status: string) => {
    switch (status) {
      case 'in_stock':
        return 'bg-green-100 text-green-800';
      case 'low_stock':
        return 'bg-yellow-100 text-yellow-800';
      case 'critical':
        return 'bg-orange-100 text-orange-800';
      case 'out_of_stock':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 状态文本
  const getStatusText = (status: string) => {
    switch (status) {
      case 'in_stock':
        return '库存充足';
      case 'low_stock':
        return '库存不足';
      case 'critical':
        return '库存紧急';
      case 'out_of_stock':
        return '缺货';
      default:
        return '未知';
    }
  };

  // 获取库存状态图标
  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'in_stock':
        return <Package className="w-4 h-4 text-green-600" />;
      case 'low_stock':
        return <TrendingDown className="w-4 h-4 text-yellow-600" />;
      case 'critical':
      case 'out_of_stock':
        return <AlertTriangle className="w-4 h-4 text-red-600" />;
      default:
        return <Package className="w-4 h-4 text-gray-600" />;
    }
  };

  // 计算库存百分比
  const getStockPercentage = (item: InventoryItem) => {
    const maxLevel = Math.max(item.warningLevel, item.currentStock);
    return Math.min((item.currentStock / maxLevel) * 100, 100);
  };

  // 库存调整
  const handleStockAdjustment = () => {
    if (!selectedItem || !adjustmentAmount || !adjustmentReason) return;
    
    const amount = parseFloat(adjustmentAmount);
    const newStock = Math.max(0, selectedItem.currentStock + amount);
    
    // 确定新状态
    let newStatus: InventoryItem['status'];
    if (newStock === 0) {
      newStatus = 'out_of_stock';
    } else if (newStock <= selectedItem.criticalLevel) {
      newStatus = 'critical';
    } else if (newStock <= selectedItem.warningLevel) {
      newStatus = 'low_stock';
    } else {
      newStatus = 'in_stock';
    }
    
    // 更新库存
    setInventory(inventory.map(item => {
      if (item.id === selectedItem.id) {
        return {
          ...item,
          currentStock: newStock,
          totalValue: newStock * item.unitCost,
          status: newStatus,
          usageHistory: [
            {
              date: new Date().toISOString().split('T')[0],
              type: 'adjustment',
              amount: amount,
              reason: adjustmentReason
            },
            ...item.usageHistory
          ]
        };
      }
      return item;
    }));
    
    // 重置表单
    setAdjustmentAmount('');
    setAdjustmentReason('');
    setShowAdjustModal(false);
    setSelectedItem(null);
  };

  // 检查是否即将过期
  const isExpiringSoon = (expiryDate?: string) => {
    if (!expiryDate) return false;
    const today = new Date();
    const expiry = new Date(expiryDate);
    const diffTime = expiry.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays <= 3 && diffDays >= 0;
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载库存中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">库存管理</h1>
          <p className="text-gray-600">管理酒吧的所有原料和商品库存</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => window.location.reload()}
            className="btn-secondary flex items-center gap-2"
          >
            <RefreshCw className="w-4 h-4" />
            刷新
          </button>
          <button className="btn-primary flex items-center gap-2">
            <Plus className="w-4 h-4" />
            添加商品
          </button>
        </div>
      </div>

      {/* 库存统计 */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-lg">
              <Package className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">库存充足</p>
              <p className="text-xl font-bold">{inventory.filter(i => i.status === 'in_stock').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-yellow-100 rounded-lg">
              <TrendingDown className="w-5 h-5 text-yellow-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">库存不足</p>
              <p className="text-xl font-bold">{inventory.filter(i => i.status === 'low_stock').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-lg">
              <AlertTriangle className="w-5 h-5 text-red-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">紧急/缺货</p>
              <p className="text-xl font-bold">{inventory.filter(i => i.status === 'critical' || i.status === 'out_of_stock').length}</p>
            </div>
          </div>
        </div>
        
        <div className="card p-4">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-primary-100 rounded-lg">
              <BarChart3 className="w-5 h-5 text-primary-600" />
            </div>
            <div>
              <p className="text-sm text-gray-600">总价值</p>
              <p className="text-xl font-bold">¥{inventory.reduce((sum, item) => sum + item.totalValue, 0).toFixed(0)}</p>
            </div>
          </div>
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
              placeholder="搜索商品名称、品牌或供应商..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          {/* 分类筛选 */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="input-field min-w-[120px]"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? '全部分类' : category}
              </option>
            ))}
          </select>
          
          {/* 状态筛选 */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="input-field min-w-[120px]"
          >
            <option value="all">全部状态</option>
            <option value="in_stock">库存充足</option>
            <option value="low_stock">库存不足</option>
            <option value="critical">库存紧急</option>
            <option value="out_of_stock">缺货</option>
          </select>
        </div>
      </div>

      {/* 库存列表 */}
      <div className="space-y-4">
        {filteredInventory.map((item) => {
          const stockPercentage = getStockPercentage(item);
          const expiringSoon = isExpiringSoon(item.expiryDate);
          
          return (
            <div key={item.id} className="card p-6">
              <div className="flex flex-col lg:flex-row lg:items-center gap-4">
                {/* 商品信息 */}
                <div className="flex-1">
                  <div className="flex items-start gap-3">
                    <div className="p-2 bg-gray-100 rounded-lg">
                      {getStatusIcon(item.status)}
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-lg font-semibold text-gray-900">{item.name}</h3>
                        <span className="text-sm text-gray-600">({item.brand})</span>
                        {expiringSoon && (
                          <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full flex items-center gap-1">
                            <AlertTriangle className="w-3 h-3" />
                            即将过期
                          </span>
                        )}
                      </div>
                      <div className="flex flex-wrap items-center gap-4 text-sm text-gray-600">
                        <span>分类: {item.category}</span>
                        <span>供应商: {item.supplier}</span>
                        <span>位置: {item.location}</span>
                        {item.expiryDate && (
                          <span className={expiringSoon ? 'text-red-600 font-medium' : ''}>
                            过期日期: {item.expiryDate}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* 库存信息 */}
                <div className="lg:w-80">
                  <div className="space-y-3">
                    {/* 状态和数量 */}
                    <div className="flex items-center justify-between">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusStyle(item.status)}`}>
                        {getStatusText(item.status)}
                      </span>
                      <div className="text-right">
                        <p className="text-lg font-bold text-gray-900">
                          {item.currentStock} {item.unit}
                        </p>
                        <p className="text-sm text-gray-600">
                          预警: {item.warningLevel} {item.unit}
                        </p>
                      </div>
                    </div>

                    {/* 库存进度条 */}
                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-gray-600">
                        <span>当前库存</span>
                        <span>{stockPercentage.toFixed(0)}%</span>
                      </div>
                      <div className="w-full bg-gray-200 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full transition-all duration-300 ${
                            item.status === 'out_of_stock' ? 'bg-red-500' :
                            item.status === 'critical' ? 'bg-orange-500' :
                            item.status === 'low_stock' ? 'bg-yellow-500' :
                            'bg-green-500'
                          }`}
                          style={{ width: `${stockPercentage}%` }}
                        ></div>
                      </div>
                      <div className="flex justify-between text-xs text-gray-500">
                        <span>紧急: {item.criticalLevel}</span>
                        <span>预警: {item.warningLevel}</span>
                      </div>
                    </div>

                    {/* 价值信息 */}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">单价: ¥{item.unitCost}</span>
                      <span className="font-medium">总值: ¥{item.totalValue.toFixed(2)}</span>
                    </div>
                  </div>
                </div>

                {/* 操作按钮 */}
                <div className="flex lg:flex-col gap-2">
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowDetailModal(true);
                    }}
                    className="btn-secondary text-sm flex items-center gap-1"
                  >
                    <Eye className="w-4 h-4" />
                    详情
                  </button>
                  <button
                    onClick={() => {
                      setSelectedItem(item);
                      setShowAdjustModal(true);
                    }}
                    className="btn-primary text-sm flex items-center gap-1"
                  >
                    <Edit className="w-4 h-4" />
                    调整
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {filteredInventory.length === 0 && (
        <div className="text-center py-12">
          <Package className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到库存商品</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索条件或添加新的商品</p>
          <button className="btn-primary">
            添加第一个商品
          </button>
        </div>
      )}

      {/* 库存详情模态框 */}
      {showDetailModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-3xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 模态框头部 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedItem.name}</h2>
                  <p className="text-gray-600">{selectedItem.brand} - {selectedItem.category}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 商品详细信息 */}
              <div className="grid grid-cols-2 gap-6 mb-6">
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">当前库存</p>
                    <p className="text-2xl font-bold text-gray-900">{selectedItem.currentStock} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">预警水平</p>
                    <p className="font-medium">{selectedItem.warningLevel} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">紧急水平</p>
                    <p className="font-medium">{selectedItem.criticalLevel} {selectedItem.unit}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">存储位置</p>
                    <p className="font-medium">{selectedItem.location}</p>
                  </div>
                </div>
                
                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-600">单位成本</p>
                    <p className="font-medium">¥{selectedItem.unitCost}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">总价值</p>
                    <p className="text-xl font-bold text-primary-600">¥{selectedItem.totalValue.toFixed(2)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">供应商</p>
                    <p className="font-medium">{selectedItem.supplier}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">最后补货</p>
                    <p className="font-medium">{selectedItem.lastRestocked}</p>
                  </div>
                  {selectedItem.expiryDate && (
                    <div>
                      <p className="text-sm text-gray-600">过期日期</p>
                      <p className={`font-medium ${
                        isExpiringSoon(selectedItem.expiryDate) ? 'text-red-600' : ''
                      }`}>
                        {selectedItem.expiryDate}
                      </p>
                    </div>
                  )}
                </div>
              </div>

              {/* 使用历史 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">使用历史</h3>
                <div className="space-y-3 max-h-60 overflow-y-auto">
                  {selectedItem.usageHistory.map((record, index) => (
                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex items-center gap-3">
                        <div className={`p-2 rounded-full ${
                          record.type === 'usage' ? 'bg-red-100' :
                          record.type === 'restock' ? 'bg-green-100' :
                          'bg-blue-100'
                        }`}>
                          {record.type === 'usage' ? (
                            <TrendingDown className={`w-4 h-4 ${
                              record.type === 'usage' ? 'text-red-600' :
                              record.type === 'restock' ? 'text-green-600' :
                              'text-blue-600'
                            }`} />
                          ) : record.type === 'restock' ? (
                            <TrendingUp className="w-4 h-4 text-green-600" />
                          ) : (
                            <Edit className="w-4 h-4 text-blue-600" />
                          )}
                        </div>
                        <div>
                          <p className="font-medium text-gray-900">
                            {record.type === 'usage' ? '使用' :
                             record.type === 'restock' ? '补货' : '调整'}
                          </p>
                          <p className="text-sm text-gray-600">{record.reason}</p>
                          {record.orderId && (
                            <p className="text-xs text-gray-500">订单 #{record.orderId}</p>
                          )}
                        </div>
                      </div>
                      <div className="text-right">
                        <p className={`font-medium ${
                          record.amount > 0 ? 'text-green-600' : 'text-red-600'
                        }`}>
                          {record.amount > 0 ? '+' : ''}{record.amount} {selectedItem.unit}
                        </p>
                        <p className="text-sm text-gray-500">{record.date}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 库存调整模态框 */}
      {showAdjustModal && selectedItem && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full">
            <div className="p-6">
              {/* 模态框头部 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">库存调整</h2>
                  <p className="text-gray-600">{selectedItem.name} ({selectedItem.brand})</p>
                </div>
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedItem(null);
                    setAdjustmentAmount('');
                    setAdjustmentReason('');
                  }}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 当前库存信息 */}
              <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-600 mb-1">当前库存</p>
                <p className="text-2xl font-bold text-gray-900">
                  {selectedItem.currentStock} {selectedItem.unit}
                </p>
              </div>

              {/* 调整表单 */}
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    调整数量 ({selectedItem.unit})
                  </label>
                  <input
                    type="number"
                    value={adjustmentAmount}
                    onChange={(e) => setAdjustmentAmount(e.target.value)}
                    placeholder="输入调整数量（正数为增加，负数为减少）"
                    className="input-field"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    调整后库存: {selectedItem.currentStock + (parseFloat(adjustmentAmount) || 0)} {selectedItem.unit}
                  </p>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    调整原因
                  </label>
                  <textarea
                    value={adjustmentReason}
                    onChange={(e) => setAdjustmentReason(e.target.value)}
                    placeholder="请输入调整原因..."
                    rows={3}
                    className="input-field"
                  />
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-3 mt-6">
                <button
                  onClick={() => {
                    setShowAdjustModal(false);
                    setSelectedItem(null);
                    setAdjustmentAmount('');
                    setAdjustmentReason('');
                  }}
                  className="flex-1 btn-secondary"
                >
                  取消
                </button>
                <button
                  onClick={handleStockAdjustment}
                  disabled={!adjustmentAmount || !adjustmentReason}
                  className="flex-1 btn-primary disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  确认调整
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Inventory;