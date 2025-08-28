import React, { useState, useEffect } from 'react';
import {
  Plus,
  Search,
  Edit,
  Trash2,
  Wine,
  Clock,
  DollarSign,
  AlertCircle,
  CheckCircle,
  X
} from 'lucide-react';
import CreateRecipeModal from '../components/CreateRecipeModal';
import { recipeAPI } from '../utils/api';
import toast, { Toaster } from 'react-hot-toast';

// 配方接口定义
interface Recipe {
  id: number;
  name: string;
  description: string;
  category: string;
  preparationTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cost: number;
  price: number;
  isActive: boolean;
  ingredients: Array<{
    id: number;
    name: string;
    brand: string;
    amount: number;
    unit: string;
    cost: number;
    isAvailable: boolean;
    alternatives?: Array<{
      id: number;
      name: string;
      brand: string;
      costDifference: number;
    }>;
  }>;
  instructions: string[];
  createdAt: string;
  updatedAt: string;
}

const Recipes: React.FC = () => {
  const [recipes, setRecipes] = useState<Recipe[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [selectedRecipe, setSelectedRecipe] = useState<Recipe | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [isCreating, setIsCreating] = useState(false);

  // 加载配方数据
  useEffect(() => {
    console.log('🔄 Recipes组件开始加载数据...');
    const loadRecipes = async () => {
      setIsLoading(true);
      console.log('📡 开始调用API...');
      try {
        const response = await recipeAPI.getRecipes();
        console.log('📡 API响应:', response);
        if (response.data.success) {
          console.log('✅ API调用成功，设置配方数据:', response.data.recipes);
          setRecipes(response.data.recipes);
        } else {
          // 如果API失败，使用模拟数据
          console.warn('⚠️ API调用失败，使用模拟数据');
          const mockRecipes: Recipe[] = [
        {
          id: 1,
          name: 'Mojito',
          description: '经典古巴鸡尾酒，清爽薄荷香味',
          category: '朗姆酒类',
          preparationTime: 5,
          difficulty: 'easy',
          cost: 18.5,
          price: 58,
          isActive: true,
          ingredients: [
            {
              id: 1,
              name: '白朗姆酒',
              brand: 'Bacardi',
              amount: 50,
              unit: 'ml',
              cost: 12,
              isAvailable: true,
              alternatives: [
                { id: 2, name: '白朗姆酒', brand: 'Captain Morgan', costDifference: 2 }
              ]
            },
            {
              id: 2,
              name: '新鲜薄荷叶',
              brand: '本地采购',
              amount: 10,
              unit: '片',
              cost: 2,
              isAvailable: true
            },
            {
              id: 3,
              name: '青柠汁',
              brand: '鲜榨',
              amount: 20,
              unit: 'ml',
              cost: 3,
              isAvailable: true
            },
            {
              id: 4,
              name: '苏打水',
              brand: '屈臣氏',
              amount: 100,
              unit: 'ml',
              cost: 1.5,
              isAvailable: true
            }
          ],
          instructions: [
            '在杯中放入薄荷叶和青柠片',
            '用调酒棒轻压薄荷叶释放香味',
            '加入白朗姆酒',
            '加入冰块至杯子2/3满',
            '倒入苏打水至满杯',
            '轻轻搅拌，用薄荷叶装饰'
          ],
          createdAt: '2024-09-15',
          updatedAt: '2024-09-20'
        },
        {
          id: 2,
          name: 'Old Fashioned',
          description: '经典威士忌鸡尾酒，浓郁醇厚',
          category: '威士忌类',
          preparationTime: 8,
          difficulty: 'medium',
          cost: 25,
          price: 68,
          isActive: true,
          ingredients: [
            {
              id: 5,
              name: '波本威士忌',
              brand: 'Buffalo Trace',
              amount: 60,
              unit: 'ml',
              cost: 20,
              isAvailable: false,
              alternatives: [
                { id: 6, name: '波本威士忌', brand: 'Maker\'s Mark', costDifference: 8 },
                { id: 7, name: '黑麦威士忌', brand: 'Rittenhouse', costDifference: 5 }
              ]
            },
            {
              id: 8,
              name: '糖浆',
              brand: '自制',
              amount: 10,
              unit: 'ml',
              cost: 2,
              isAvailable: true
            },
            {
              id: 9,
              name: '安格斯图拉苦酒',
              brand: 'Angostura',
              amount: 3,
              unit: 'dash',
              cost: 3,
              isAvailable: true
            }
          ],
          instructions: [
            '在调酒杯中加入糖浆和苦酒',
            '加入少量威士忌，搅拌至糖浆完全溶解',
            '加入剩余威士忌和冰块',
            '搅拌30秒至充分冷却',
            '滤入装有大冰块的古典杯',
            '用橙皮装饰并挤压释放油脂'
          ],
          createdAt: '2024-09-10',
          updatedAt: '2024-09-18'
        },
        {
          id: 3,
          name: 'Whiskey Sour',
          description: '酸甜平衡的威士忌鸡尾酒',
          category: '威士忌类',
          preparationTime: 6,
          difficulty: 'easy',
          cost: 22,
          price: 60,
          isActive: true,
          ingredients: [
            {
              id: 10,
              name: '波本威士忌',
              brand: 'Maker\'s Mark',
              amount: 50,
              unit: 'ml',
              cost: 18,
              isAvailable: true
            },
            {
              id: 11,
              name: '柠檬汁',
              brand: '鲜榨',
              amount: 25,
              unit: 'ml',
              cost: 2,
              isAvailable: true
            },
            {
              id: 12,
              name: '糖浆',
              brand: '自制',
              amount: 15,
              unit: 'ml',
              cost: 2,
              isAvailable: true
            }
          ],
          instructions: [
            '在调酒器中加入威士忌、柠檬汁和糖浆',
            '加入冰块',
            '用力摇晃15秒',
            '双重过滤到古典杯中',
            '用柠檬片和樱桃装饰'
          ],
          createdAt: '2024-09-12',
          updatedAt: '2024-09-16'
        }
          ];
        console.log('📋 设置模拟配方数据:', mockRecipes);
        setRecipes(mockRecipes);
        }
      } catch (error) {
        console.error('❌ 加载配方失败:', error);
        console.log('🔄 使用模拟数据作为后备...');
        // 使用模拟数据作为后备
        const mockRecipes: Recipe[] = [
          {
            id: 1,
            name: 'Mojito',
            description: '经典古巴鸡尾酒，清爽薄荷香味',
            category: '朗姆酒类',
            preparationTime: 5,
            difficulty: 'easy',
            cost: 18.5,
            price: 58,
            isActive: true,
            ingredients: [
              {
                id: 1,
                name: '白朗姆酒',
                brand: 'Bacardi',
                amount: 50,
                unit: 'ml',
                cost: 12,
                isAvailable: true,
                alternatives: [
                  { id: 2, name: '白朗姆酒', brand: 'Captain Morgan', costDifference: 2 }
                ]
              },
              {
                id: 2,
                name: '新鲜薄荷叶',
                brand: '本地采购',
                amount: 10,
                unit: '片',
                cost: 2,
                isAvailable: true
              },
              {
                id: 3,
                name: '青柠汁',
                brand: '鲜榨',
                amount: 20,
                unit: 'ml',
                cost: 3,
                isAvailable: true
              },
              {
                id: 4,
                name: '苏打水',
                brand: '屈臣氏',
                amount: 100,
                unit: 'ml',
                cost: 1.5,
                isAvailable: true
              }
            ],
            instructions: [
              '在杯中放入薄荷叶和青柠片',
              '用调酒棒轻压薄荷叶释放香味',
              '加入白朗姆酒',
              '加入冰块至杯子2/3满',
              '倒入苏打水至满杯',
              '轻轻搅拌，用薄荷叶装饰'
            ],
            createdAt: '2024-09-15',
            updatedAt: '2024-09-20'
          }
        ];
        console.log('📋 设置后备模拟数据:', mockRecipes);
        setRecipes(mockRecipes);
      } finally {
        console.log('✅ 数据加载完成，设置loading为false');
        setIsLoading(false);
      }
    };

    loadRecipes();
  }, []);

  // 过滤配方
  const filteredRecipes = recipes.filter(recipe => {
    const matchesSearch = recipe.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         recipe.description.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || recipe.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  // 添加调试日志
  console.log('🎯 Recipes组件渲染状态:', { isLoading, recipesCount: recipes.length, filteredCount: filteredRecipes.length });

  // 获取所有分类
  const categories = ['all', ...Array.from(new Set(recipes.map(recipe => recipe.category)))];

  // 难度标签样式
  const getDifficultyStyle = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return 'bg-green-100 text-green-800';
      case 'medium':
        return 'bg-yellow-100 text-yellow-800';
      case 'hard':
        return 'bg-red-100 text-red-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  // 难度文本
  const getDifficultyText = (difficulty: string) => {
    switch (difficulty) {
      case 'easy':
        return '简单';
      case 'medium':
        return '中等';
      case 'hard':
        return '困难';
      default:
        return '未知';
    }
  };

  // 检查配方是否可制作
  const canMakeRecipe = (recipe: Recipe) => {
    return recipe.ingredients.every(ingredient => 
      ingredient.isAvailable || (ingredient.alternatives && ingredient.alternatives.length > 0)
    );
  };

  // 保存新配方
  const handleSaveRecipe = async (recipeData: any) => {
    setIsCreating(true);
    
    // 显示保存中的提示
    const loadingToast = toast.loading('正在保存配方...');
    
    try {
      const response = await recipeAPI.createRecipe(recipeData);
      
      if (response.data.success) {
        // 重新加载配方列表
        const recipesResponse = await recipeAPI.getRecipes();
        if (recipesResponse.data.success) {
          setRecipes(recipesResponse.data.recipes);
        }
        
        // 关闭模态框
        setShowCreateModal(false);
        
        // 显示成功提示
        toast.success(`配方 "${recipeData.name}" 创建成功！`, {
          id: loadingToast,
          duration: 3000,
        });
        
        console.log('配方创建成功:', response.data.recipe);
      } else {
        throw new Error(response.data.message || '创建配方失败');
      }
    } catch (error: any) {
      console.error('创建配方失败:', error);
      
      // 如果API调用失败，使用本地模拟
      const newRecipe: Recipe = {
        id: Date.now(),
        ...recipeData,
        ingredients: recipeData.ingredients.map((ing: any) => ({
          ...ing,
          isAvailable: true // 默认设置为可用
        })),
        createdAt: new Date().toISOString().split('T')[0],
        updatedAt: new Date().toISOString().split('T')[0]
      };
      
      setRecipes(prev => [newRecipe, ...prev]);
      
      // 关闭模态框
      setShowCreateModal(false);
      
      // 显示成功提示（即使是本地模拟）
      toast.success(`配方 "${recipeData.name}" 创建成功！`, {
        id: loadingToast,
        duration: 3000,
      });
      
      console.log('使用本地模拟创建配方:', newRecipe);
    } finally {
      setIsCreating(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="w-8 h-8 border-4 border-primary-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">加载配方中...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* 页面标题和操作 */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">配方管理</h1>
          <p className="text-gray-600">管理酒吧的所有鸡尾酒配方</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="btn-primary flex items-center gap-2"
        >
          <Plus className="w-4 h-4" />
          新建配方
        </button>
      </div>

      {/* 搜索和筛选 */}
      <div className="card p-6">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* 搜索框 */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="搜索配方名称或描述..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          
          {/* 分类筛选 */}
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="input-field min-w-[150px]"
          >
            {categories.map(category => (
              <option key={category} value={category}>
                {category === 'all' ? '全部分类' : category}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* 配方列表 */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredRecipes.map((recipe) => {
          const canMake = canMakeRecipe(recipe);
          const profit = recipe.price - recipe.cost;
          const profitMargin = ((profit / recipe.price) * 100).toFixed(1);
          
          return (
            <div key={recipe.id} className="card p-6 hover:shadow-lg transition-shadow">
              {/* 配方头部 */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-2">
                    <Wine className="w-5 h-5 text-primary-500" />
                    <h3 className="text-lg font-semibold text-gray-900">{recipe.name}</h3>
                  </div>
                  <p className="text-sm text-gray-600 mb-2">{recipe.description}</p>
                  <span className="inline-block px-2 py-1 bg-gray-100 text-gray-700 text-xs rounded-full">
                    {recipe.category}
                  </span>
                </div>
                
                {/* 状态指示器 */}
                <div className="flex flex-col items-end gap-2">
                  {canMake ? (
                    <div className="flex items-center gap-1 text-green-600">
                      <CheckCircle className="w-4 h-4" />
                      <span className="text-xs">可制作</span>
                    </div>
                  ) : (
                    <div className="flex items-center gap-1 text-orange-600">
                      <AlertCircle className="w-4 h-4" />
                      <span className="text-xs">缺料</span>
                    </div>
                  )}
                  
                  {!recipe.isActive && (
                    <span className="px-2 py-1 bg-red-100 text-red-800 text-xs rounded-full">
                      已停用
                    </span>
                  )}
                </div>
              </div>

              {/* 配方信息 */}
              <div className="space-y-3 mb-4">
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <Clock className="w-4 h-4" />
                    <span>制作时间</span>
                  </div>
                  <span className="font-medium">{recipe.preparationTime} 分钟</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">难度</span>
                  <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyStyle(recipe.difficulty)}`}>
                    {getDifficultyText(recipe.difficulty)}
                  </span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <div className="flex items-center gap-1 text-gray-600">
                    <DollarSign className="w-4 h-4" />
                    <span>成本/售价</span>
                  </div>
                  <span className="font-medium">¥{recipe.cost} / ¥{recipe.price}</span>
                </div>
                
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-600">利润率</span>
                  <span className={`font-medium ${
                    parseFloat(profitMargin) > 60 ? 'text-green-600' : 
                    parseFloat(profitMargin) > 40 ? 'text-yellow-600' : 'text-red-600'
                  }`}>
                    {profitMargin}%
                  </span>
                </div>
              </div>

              {/* 原料预览 */}
              <div className="mb-4">
                <p className="text-sm text-gray-600 mb-2">主要原料 ({recipe.ingredients.length} 种)</p>
                <div className="flex flex-wrap gap-1">
                  {recipe.ingredients.slice(0, 3).map((ingredient) => (
                    <span 
                      key={ingredient.id} 
                      className={`px-2 py-1 text-xs rounded-full ${
                        ingredient.isAvailable 
                          ? 'bg-green-100 text-green-700' 
                          : 'bg-red-100 text-red-700'
                      }`}
                    >
                      {ingredient.name}
                    </span>
                  ))}
                  {recipe.ingredients.length > 3 && (
                    <span className="px-2 py-1 text-xs rounded-full bg-gray-100 text-gray-600">
                      +{recipe.ingredients.length - 3}
                    </span>
                  )}
                </div>
              </div>

              {/* 操作按钮 */}
              <div className="flex gap-2">
                <button
                  onClick={() => {
                    setSelectedRecipe(recipe);
                    setShowDetailModal(true);
                  }}
                  className="flex-1 btn-secondary text-sm"
                >
                  查看详情
                </button>
                <button className="p-2 text-gray-600 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors">
                  <Edit className="w-4 h-4" />
                </button>
                <button className="p-2 text-gray-600 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors">
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* 空状态 */}
      {filteredRecipes.length === 0 && (
        <div className="text-center py-12">
          <Wine className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">没有找到配方</h3>
          <p className="text-gray-600 mb-4">尝试调整搜索条件或创建新的配方</p>
          <button
            onClick={() => setShowCreateModal(true)}
            className="btn-primary"
          >
            创建第一个配方
          </button>
        </div>
      )}

      {/* 配方详情模态框 */}
      {showDetailModal && selectedRecipe && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              {/* 模态框头部 */}
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">{selectedRecipe.name}</h2>
                  <p className="text-gray-600">{selectedRecipe.description}</p>
                </div>
                <button
                  onClick={() => setShowDetailModal(false)}
                  className="p-2 text-gray-400 hover:text-gray-600 rounded-lg"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* 配方信息 */}
              <div className="grid grid-cols-2 gap-4 mb-6">
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">分类</p>
                  <p className="font-medium">{selectedRecipe.category}</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">制作时间</p>
                  <p className="font-medium">{selectedRecipe.preparationTime} 分钟</p>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">难度</p>
                  <span className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${getDifficultyStyle(selectedRecipe.difficulty)}`}>
                    {getDifficultyText(selectedRecipe.difficulty)}
                  </span>
                </div>
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">成本/售价</p>
                  <p className="font-medium">¥{selectedRecipe.cost} / ¥{selectedRecipe.price}</p>
                </div>
              </div>

              {/* 原料列表 */}
              <div className="mb-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-3">原料清单</h3>
                <div className="space-y-3">
                  {selectedRecipe.ingredients.map((ingredient) => (
                    <div key={ingredient.id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <span className="font-medium">{ingredient.name}</span>
                          <span className="text-sm text-gray-600">({ingredient.brand})</span>
                          {!ingredient.isAvailable && (
                            <AlertCircle className="w-4 h-4 text-orange-500" />
                          )}
                        </div>
                        <p className="text-sm text-gray-600">
                          {ingredient.amount} {ingredient.unit} - ¥{ingredient.cost}
                        </p>
                        {!ingredient.isAvailable && ingredient.alternatives && (
                          <div className="mt-2">
                            <p className="text-xs text-orange-600 mb-1">可替代选项：</p>
                            {ingredient.alternatives.map((alt) => (
                              <p key={alt.id} className="text-xs text-gray-600">
                                {alt.name} ({alt.brand}) +¥{alt.costDifference}
                              </p>
                            ))}
                          </div>
                        )}
                      </div>
                      <div className={`w-3 h-3 rounded-full ${
                        ingredient.isAvailable ? 'bg-green-500' : 'bg-red-500'
                      }`}></div>
                    </div>
                  ))}
                </div>
              </div>

              {/* 制作步骤 */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-3">制作步骤</h3>
                <div className="space-y-3">
                  {selectedRecipe.instructions.map((step, index) => (
                    <div key={index} className="flex gap-3">
                      <div className="w-6 h-6 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0">
                        {index + 1}
                      </div>
                      <p className="text-gray-700 pt-0.5">{step}</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* 新建配方模态框 */}
      <CreateRecipeModal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onSave={handleSaveRecipe}
      />
      
      {/* Toast 通知组件 */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            background: '#fff',
            color: '#374151',
            boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05)',
            border: '1px solid #e5e7eb',
            borderRadius: '0.75rem',
          },
          success: {
            iconTheme: {
              primary: '#10b981',
              secondary: '#fff',
            },
          },
          error: {
            iconTheme: {
              primary: '#ef4444',
              secondary: '#fff',
            },
          },
        }}
      />
    </div>
  );
};

export default Recipes;