import React, { useState, useEffect } from 'react';
import {
  BarChart3,
  TrendingUp,
  TrendingDown,
  DollarSign,
  Calendar,
  Download,
  Filter,
  PieChart,
  LineChart,
  Package,
  Wine,
  Users,
  Clock
} from 'lucide-react';

// 报表数据接口
interface SalesData {
  date: string;
  revenue: number;
  orders: number;
  profit: number;
}

interface ProductSales {
  id: number;
  name: string;
  category: string;
  quantity: number;
  revenue: number;
  profit: number;
  profitMargin: number;
}

interface PeriodSummary {
  totalRevenue: number;
  totalOrders: number;
  totalProfit: number;
  averageOrderValue: number;
  profitMargin: number;
  topProduct: string;
  peakHour: string;
}

interface InventoryReport {
  totalValue: number;
  lowStockItems: number;
  criticalItems: number;
  expiringItems: number;
  topValueItems: Array<{
    name: string;
    brand: string;
    value: number;
    percentage: number;
  }>;
}

const Reports: React.FC = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('7days');
  const [reportType, setReportType] = useState('sales');
  const [salesData, setSalesData] = useState<SalesData[]>([]);
  const [productSales, setProductSales] = useState<ProductSales[]>([]);
  const [periodSummary, setPeriodSummary] = useState<PeriodSummary | null>(null);
  const [inventoryReport, setInventoryReport] = useState<InventoryReport | null>(null);

  // 模拟数据加载
  useEffect(() => {
    const loadReportData = async () => {
      setIsLoading(true);
      
      // 模拟API调用延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 模拟销售数据
      const mockSalesData: SalesData[] = [
        { date: '2024-09-25', revenue: 1250, orders: 18, profit: 625 },
        { date: '2024-09-26', revenue: 1580, orders: 22, profit: 790 },
        { date: '2024-09-27', revenue: 980, orders: 15, profit: 490 },
        { date: '2024-09-28', revenue: 2100, orders: 28, profit: 1050 },
        { date: '2024-09-29', revenue: 1750, orders: 25, profit: 875 },
        { date: '2024-09-30', revenue: 2250, orders: 32, profit: 1125 },
        { date: '2024-10-01', revenue: 2580, orders: 35, profit: 1290 }
      ];
      
      // 模拟产品销售数据
      const mockProductSales: ProductSales[] = [
        {
          id: 1,
          name: 'Mojito',
          category: '朗姆酒类',
          quantity: 45,
          revenue: 2610,
          profit: 1305,
          profitMargin: 50
        },
        {
          id: 2,
          name: 'Old Fashioned',
          category: '威士忌类',
          quantity: 32,
          revenue: 2176,
          profit: 1088,
          profitMargin: 50
        },
        {
          id: 3,
          name: 'Whiskey Sour',
          category: '威士忌类',
          quantity: 28,
          revenue: 1680,
          profit: 840,
          profitMargin: 50
        },
        {
          id: 4,
          name: 'Daiquiri',
          category: '朗姆酒类',
          quantity: 18,
          revenue: 1080,
          profit: 540,
          profitMargin: 50
        },
        {
          id: 5,
          name: 'Manhattan',
          category: '威士忌类',
          quantity: 15,
          revenue: 1050,
          profit: 525,
          profitMargin: 50
        }
      ];
      
      // 模拟期间汇总
      const mockPeriodSummary: PeriodSummary = {
        totalRevenue: 12490,
        totalOrders: 175,
        totalProfit: 6245,
        averageOrderValue: 71.37,
        profitMargin: 50,
        topProduct: 'Mojito',
        peakHour: '20:00-21:00'
      };
      
      // 模拟库存报表
      const mockInventoryReport: InventoryReport = {
        totalValue: 1300,
        lowStockItems: 3,
        criticalItems: 1,
        expiringItems: 2,
        topValueItems: [
          { name: 'Maker\'s Mark 波本威士忌', brand: 'Maker\'s Mark', value: 936, percentage: 72 },
          { name: 'Bacardi 白朗姆酒', brand: 'Bacardi', value: 288, percentage: 22 },
          { name: '柠檬汁', brand: '鲜榨', value: 36, percentage: 3 },
          { name: '新鲜薄荷叶', brand: '本地采购', value: 30, percentage: 2 },
          { name: '糖浆', brand: '自制', value: 10, percentage: 1 }
        ]
      };
      
      setSalesData(mockSalesData);
      setProductSales(mockProductSales);
      setPeriodSummary(mockPeriodSummary);
      setInventoryReport(mockInventoryReport);
      setIsLoading(false);
    };

    loadReportData();
  }, [dateRange]);

  // 获取日期范围文本
  const getDateRangeText = (range: string) => {
    switch (range) {
      case '1day':
        return '今日';
      case '7days':
        return '近7天';
      case '30days':
        return '近30天';
      case '90days':
        return '近90天';
      default:
        return '近7天';
    }
  };

  // 导出报表
  const exportReport = () => {
    // 模拟导出功能
    const data = {
      dateRange: getDateRangeText(dateRange),
      reportType,
      generatedAt: new Date().toISOString(),
      summary: periodSummary,
      salesData,
      productSales,
      inventoryReport
    };
    
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report_${dateRange}_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">生成报表中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">数据报表</h1>
          <p className="text-gray-600">查看销售、利润和库存分析报表</p>
        </div>
        <button
          onClick={exportReport}
          className="btn-primary flex items-center gap-2"
        >
          <Download className="w-4 h-4" />
          导出报表
        </button>
      </div>

      {/* 筛选控件 */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 日期范围 */}
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <select
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
              className="input-field min-w-[120px]"
            >
              <option value="1day">今日</option>
              <option value="7days">近7天</option>
              <option value="30days">近30天</option>
              <option value="90days">近90天</option>
            </select>
          </div>
          
          {/* 报表类型 */}
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-500" />
            <select
              value={reportType}
              onChange={(e) => setReportType(e.target.value)}
              className="input-field min-w-[120px]"
            >
              <option value="sales">销售报表</option>
              <option value="profit">利润分析</option>
              <option value="inventory">库存报表</option>
              <option value="comprehensive">综合报表</option>
            </select>
          </div>
          
          <div className="text-sm text-gray-600 flex items-center">
            报表期间: {getDateRangeText(dateRange)}
          </div>
        </div>
      </div>

      {/* 关键指标卡片 */}
      {periodSummary && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* 总营业额 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总营业额</p>
                <p className="text-2xl font-bold text-gray-900">¥{periodSummary.totalRevenue.toLocaleString()}</p>
                <p className="text-sm text-green-600 flex items-center gap-1">
                  <TrendingUp className="w-4 h-4" />
                  较上期 +12.5%
                </p>
              </div>
              <div className="p-3 bg-green-100 rounded-full">
                <DollarSign className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          {/* 订单数量 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">订单数量</p>
                <p className="text-2xl font-bold text-gray-900">{periodSummary.totalOrders}</p>
                <p className="text-sm text-blue-600">平均 {(periodSummary.totalOrders / 7).toFixed(1)} 单/天</p>
              </div>
              <div className="p-3 bg-blue-100 rounded-full">
                <BarChart3 className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          {/* 总利润 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">总利润</p>
                <p className="text-2xl font-bold text-gray-900">¥{periodSummary.totalProfit.toLocaleString()}</p>
                <p className="text-sm text-purple-600">利润率 {periodSummary.profitMargin}%</p>
              </div>
              <div className="p-3 bg-purple-100 rounded-full">
                <TrendingUp className="w-6 h-6 text-purple-600" />
              </div>
            </div>
          </div>

          {/* 平均客单价 */}
          <div className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">平均客单价</p>
                <p className="text-2xl font-bold text-gray-900">¥{periodSummary.averageOrderValue.toFixed(0)}</p>
                <p className="text-sm text-orange-600">热销: {periodSummary.topProduct}</p>
              </div>
              <div className="p-3 bg-orange-100 rounded-full">
                <Users className="w-6 h-6 text-orange-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 销售趋势图 */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <LineChart className="w-5 h-5 text-blue-500" />
            <h2 className="text-lg font-semibold text-gray-900">销售趋势</h2>
          </div>
          <div className="space-y-4">
            {/* 简化的图表展示 */}
            <div className="h-48 bg-gray-50 rounded-lg flex items-center justify-center">
              <div className="text-center text-gray-500">
                <BarChart3 className="w-12 h-12 mx-auto mb-2" />
                <p>销售趋势图表</p>
                <p className="text-sm">最高: ¥{Math.max(...salesData.map(d => d.revenue))} ({salesData.find(d => d.revenue === Math.max(...salesData.map(d => d.revenue)))?.date})</p>
              </div>
            </div>
            
            {/* 趋势数据列表 */}
            <div className="space-y-2 max-h-32 overflow-y-auto">
              {salesData.slice(-5).map((data, index) => (
                <div key={index} className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">{data.date}</span>
                  <div className="flex items-center gap-4">
                    <span className="font-medium">¥{data.revenue}</span>
                    <span className="text-gray-500">{data.orders}单</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* 产品销售排行 */}
        <div className="card p-6">
          <div className="flex items-center gap-2 mb-4">
            <Wine className="w-5 h-5 text-primary-500" />
            <h2 className="text-lg font-semibold text-gray-900">产品销售排行</h2>
          </div>
          <div className="space-y-3">
            {productSales.map((product, index) => (
              <div key={product.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold">
                    {index + 1}
                  </div>
                  <div>
                    <p className="font-medium text-gray-900">{product.name}</p>
                    <p className="text-sm text-gray-600">{product.category}</p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-medium text-gray-900">¥{product.revenue}</p>
                  <p className="text-sm text-gray-600">{product.quantity} 杯</p>
                  <p className="text-xs text-green-600">利润 {product.profitMargin}%</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* 库存报表 */}
      {inventoryReport && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* 库存概览 */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <Package className="w-5 h-5 text-orange-500" />
              <h2 className="text-lg font-semibold text-gray-900">库存概览</h2>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-2xl font-bold text-blue-600">¥{inventoryReport.totalValue}</p>
                <p className="text-sm text-blue-600">总库存价值</p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-2xl font-bold text-green-600">{inventoryReport.topValueItems.length}</p>
                <p className="text-sm text-green-600">库存品种</p>
              </div>
            </div>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <TrendingDown className="w-4 h-4 text-yellow-600" />
                  <span className="text-sm font-medium text-yellow-800">库存不足</span>
                </div>
                <span className="text-lg font-bold text-yellow-600">{inventoryReport.lowStockItems}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Package className="w-4 h-4 text-red-600" />
                  <span className="text-sm font-medium text-red-800">紧急补货</span>
                </div>
                <span className="text-lg font-bold text-red-600">{inventoryReport.criticalItems}</span>
              </div>
              
              <div className="flex items-center justify-between p-3 bg-orange-50 border border-orange-200 rounded-lg">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-orange-600" />
                  <span className="text-sm font-medium text-orange-800">即将过期</span>
                </div>
                <span className="text-lg font-bold text-orange-600">{inventoryReport.expiringItems}</span>
              </div>
            </div>
          </div>

          {/* 库存价值分布 */}
          <div className="card p-6">
            <div className="flex items-center gap-2 mb-4">
              <PieChart className="w-5 h-5 text-purple-500" />
              <h2 className="text-lg font-semibold text-gray-900">库存价值分布</h2>
            </div>
            
            <div className="space-y-3">
              {inventoryReport.topValueItems.map((item, index) => (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <div>
                      <p className="font-medium text-gray-900">{item.name}</p>
                      <p className="text-gray-600">{item.brand}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium">¥{item.value}</p>
                      <p className="text-gray-600">{item.percentage}%</p>
                    </div>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-purple-500 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${item.percentage}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* 营业时间分析 */}
      <div className="card p-6">
        <div className="flex items-center gap-2 mb-4">
          <Clock className="w-5 h-5 text-indigo-500" />
          <h2 className="text-lg font-semibold text-gray-900">营业时间分析</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center p-4 bg-indigo-50 rounded-lg">
            <p className="text-2xl font-bold text-indigo-600">{periodSummary?.peakHour}</p>
            <p className="text-sm text-indigo-600">高峰时段</p>
          </div>
          
          <div className="text-center p-4 bg-green-50 rounded-lg">
            <p className="text-2xl font-bold text-green-600">18:00-22:00</p>
            <p className="text-sm text-green-600">主要营业时间</p>
          </div>
          
          <div className="text-center p-4 bg-blue-50 rounded-lg">
            <p className="text-2xl font-bold text-blue-600">85%</p>
            <p className="text-sm text-blue-600">高峰时段占比</p>
          </div>
        </div>
        
        <div className="mt-6">
          <p className="text-sm text-gray-600 mb-3">各时段销售分布</p>
          <div className="grid grid-cols-12 gap-1">
            {Array.from({ length: 24 }, (_, hour) => {
              const isActive = hour >= 18 && hour <= 22;
              const isPeak = hour >= 20 && hour <= 21;
              return (
                <div key={hour} className="text-center">
                  <div className={`h-8 rounded mb-1 ${
                    isPeak ? 'bg-red-500' :
                    isActive ? 'bg-blue-500' :
                    'bg-gray-200'
                  }`}></div>
                  <span className="text-xs text-gray-500">{hour}</span>
                </div>
              );
            })}
          </div>
          <div className="flex items-center gap-4 mt-3 text-xs">
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-red-500 rounded"></div>
              <span>高峰时段</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-blue-500 rounded"></div>
              <span>营业时间</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="w-3 h-3 bg-gray-200 rounded"></div>
              <span>非营业时间</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;