import React, { useState, useEffect } from 'react';
import {
  X,
  Plus,
  Trash2,
  Move,
  DollarSign,
  Clock,
  AlertTriangle,
  Save,
  RotateCcw
} from 'lucide-react';

// 原料接口定义
interface Ingredient {
  id: string;
  name: string;
  brand: string;
  amount: number;
  unit: string;
  cost: number;
}

// 配方表单数据接口
interface RecipeFormData {
  name: string;
  description: string;
  category: string;
  preparationTime: number;
  difficulty: 'easy' | 'medium' | 'hard';
  cost: number;
  price: number;
  ingredients: Ingredient[];
  instructions: string[];
  isActive: boolean;
}

// 表单验证错误接口
interface FormErrors {
  name?: string;
  description?: string;
  category?: string;
  preparationTime?: string;
  price?: string;
  ingredients?: string;
  instructions?: string;
}

interface CreateRecipeModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (recipe: RecipeFormData) => Promise<void>;
}

const CreateRecipeModal: React.FC<CreateRecipeModalProps> = ({
  isOpen,
  onClose,
  onSave
}) => {
  // 表单状态
  const [formData, setFormData] = useState<RecipeFormData>({
    name: '',
    description: '',
    category: '',
    preparationTime: 5,
    difficulty: 'easy',
    cost: 0,
    price: 0,
    ingredients: [],
    instructions: [''],
    isActive: true
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isLoading, setIsLoading] = useState(false);
  const [currentStep, setCurrentStep] = useState(1); // 1: 基本信息, 2: 原料, 3: 制作步骤
  const [isSaving, setIsSaving] = useState(false);

  // 预定义分类
  const categories = [
    '朗姆酒类',
    '威士忌类',
    '伏特加类',
    '金酒类',
    '龙舌兰类',
    '白兰地类',
    '利口酒类',
    '无酒精类'
  ];

  // 预定义单位
  const units = ['ml', 'cl', 'oz', '片', '个', 'dash', 'tsp', 'tbsp'];

  // 重置表单
  const resetForm = () => {
    setFormData({
      name: '',
      description: '',
      category: '',
      preparationTime: 5,
      difficulty: 'easy',
      cost: 0,
      price: 0,
      ingredients: [],
      instructions: [''],
      isActive: true
    });
    setErrors({});
    setCurrentStep(1);
  };

  // 计算总成本
  useEffect(() => {
    const totalCost = formData.ingredients.reduce((sum, ingredient) => sum + ingredient.cost, 0);
    setFormData(prev => ({ ...prev, cost: totalCost }));
  }, [formData.ingredients]);

  // 表单验证
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};

    // 基本信息验证
    if (!formData.name.trim()) {
      newErrors.name = '配方名称不能为空';
    } else if (formData.name.length < 2) {
      newErrors.name = '配方名称至少需要2个字符';
    }

    if (!formData.description.trim()) {
      newErrors.description = '配方描述不能为空';
    }

    if (!formData.category) {
      newErrors.category = '请选择配方分类';
    }

    if (formData.preparationTime < 1 || formData.preparationTime > 60) {
      newErrors.preparationTime = '制作时间应在1-60分钟之间';
    }

    if (formData.price <= 0) {
      newErrors.price = '售价必须大于0';
    } else if (formData.price <= formData.cost) {
      newErrors.price = '售价应高于成本';
    }

    // 原料验证
    if (formData.ingredients.length === 0) {
      newErrors.ingredients = '至少需要添加一种原料';
    } else {
      const hasInvalidIngredient = formData.ingredients.some(ingredient => 
        !ingredient.name.trim() || !ingredient.brand.trim() || ingredient.amount <= 0 || ingredient.cost < 0
      );
      if (hasInvalidIngredient) {
        newErrors.ingredients = '请完善所有原料信息';
      }
    }

    // 制作步骤验证
    const validInstructions = formData.instructions.filter(instruction => instruction.trim());
    if (validInstructions.length === 0) {
      newErrors.instructions = '至少需要添加一个制作步骤';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // 添加原料
  const addIngredient = () => {
    const newIngredient: Ingredient = {
      id: Date.now().toString(),
      name: '',
      brand: '',
      amount: 0,
      unit: 'ml',
      cost: 0
    };
    setFormData(prev => ({
      ...prev,
      ingredients: [...prev.ingredients, newIngredient]
    }));
  };

  // 删除原料
  const removeIngredient = (id: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.filter(ingredient => ingredient.id !== id)
    }));
  };

  // 更新原料
  const updateIngredient = (id: string, field: keyof Ingredient, value: string | number) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients.map(ingredient => 
        ingredient.id === id ? { ...ingredient, [field]: value } : ingredient
      )
    }));
  };

  // 添加制作步骤
  const addInstruction = () => {
    setFormData(prev => ({
      ...prev,
      instructions: [...prev.instructions, '']
    }));
  };

  // 删除制作步骤
  const removeInstruction = (index: number) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.filter((_, i) => i !== index)
    }));
  };

  // 更新制作步骤
  const updateInstruction = (index: number, value: string) => {
    setFormData(prev => ({
      ...prev,
      instructions: prev.instructions.map((instruction, i) => 
        i === index ? value : instruction
      )
    }));
  };

  // 移动制作步骤
  const moveInstruction = (fromIndex: number, toIndex: number) => {
    const newInstructions = [...formData.instructions];
    const [movedItem] = newInstructions.splice(fromIndex, 1);
    newInstructions.splice(toIndex, 0, movedItem);
    setFormData(prev => ({ ...prev, instructions: newInstructions }));
  };

  // 保存配方
  const handleSave = async () => {
    if (!validateForm()) {
      // 如果验证失败，跳转到第一个有错误的步骤
      if (errors.name || errors.description || errors.category || errors.preparationTime || errors.price) {
        setCurrentStep(1);
      } else if (errors.ingredients) {
        setCurrentStep(2);
      } else if (errors.instructions) {
        setCurrentStep(3);
      }
      return;
    }

    setIsLoading(true);
    setIsSaving(true);
    
    try {
      // 清理空的制作步骤
      const cleanedInstructions = formData.instructions.filter(instruction => instruction.trim());
      const finalFormData = { ...formData, instructions: cleanedInstructions };
      
      // 调用父组件的保存函数，父组件会处理模态框关闭和提示
      await onSave(finalFormData);
      
      // 重置表单状态
      resetForm();
    } catch (error) {
      console.error('保存配方失败:', error);
      // 错误处理已在父组件中完成
    } finally {
      setIsLoading(false);
      setIsSaving(false);
    }
  };

  // 计算利润率
  const profitMargin = formData.price > 0 ? ((formData.price - formData.cost) / formData.price * 100).toFixed(1) : '0';

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      {/* 保存中的遮罩层 */}
      {isSaving && (
        <div className="absolute inset-0 bg-black bg-opacity-30 flex items-center justify-center z-10">
          <div className="bg-white rounded-2xl p-6 shadow-2xl flex items-center gap-4">
            <div className="w-6 h-6 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-700 font-medium">正在保存配方...</span>
          </div>
        </div>
      )}
      <div className="bg-white rounded-2xl max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* 模态框头部 */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className="text-2xl font-bold text-gray-900">新建配方</h2>
            <p className="text-gray-600">创建一个新的鸡尾酒配方</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-gray-400 hover:text-gray-600 rounded-lg transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        {/* 步骤指示器 */}
        <div className="flex items-center justify-center p-4 border-b border-gray-200">
          <div className="flex items-center space-x-4">
            {[1, 2, 3].map((step) => (
              <div key={step} className="flex items-center">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                  currentStep >= step 
                    ? 'bg-primary-500 text-white' 
                    : 'bg-gray-200 text-gray-600'
                }`}>
                  {step}
                </div>
                <span className={`ml-2 text-sm ${
                  currentStep >= step ? 'text-primary-600 font-medium' : 'text-gray-500'
                }`}>
                  {step === 1 ? '基本信息' : step === 2 ? '原料配比' : '制作步骤'}
                </span>
                {step < 3 && (
                  <div className={`w-8 h-0.5 ml-4 ${
                    currentStep > step ? 'bg-primary-500' : 'bg-gray-200'
                  }`} />
                )}
              </div>
            ))}
          </div>
        </div>

        {/* 表单内容 */}
        <div className="flex-1 overflow-y-auto p-6">
          {/* 步骤1: 基本信息 */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* 配方名称 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    配方名称 <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={`input-field ${errors.name ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                    placeholder="例如：Mojito"
                  />
                  {errors.name && (
                    <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                  )}
                </div>

                {/* 分类 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    分类 <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))}
                    className={`input-field ${errors.category ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  >
                    <option value="">请选择分类</option>
                    {categories.map(category => (
                      <option key={category} value={category}>{category}</option>
                    ))}
                  </select>
                  {errors.category && (
                    <p className="mt-1 text-sm text-red-600">{errors.category}</p>
                  )}
                </div>
              </div>

              {/* 配方描述 */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  配方描述 <span className="text-red-500">*</span>
                </label>
                <textarea
                  value={formData.description}
                  onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                  className={`input-field ${errors.description ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  rows={3}
                  placeholder="描述这款鸡尾酒的特色和口感..."
                />
                {errors.description && (
                  <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* 制作时间 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    制作时间 (分钟) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="60"
                    value={formData.preparationTime}
                    onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || 0 }))}
                    className={`input-field ${errors.preparationTime ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.preparationTime && (
                    <p className="mt-1 text-sm text-red-600">{errors.preparationTime}</p>
                  )}
                </div>

                {/* 难度 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    制作难度
                  </label>
                  <select
                    value={formData.difficulty}
                    onChange={(e) => setFormData(prev => ({ ...prev, difficulty: e.target.value as 'easy' | 'medium' | 'hard' }))}
                    className="input-field"
                  >
                    <option value="easy">简单</option>
                    <option value="medium">中等</option>
                    <option value="hard">困难</option>
                  </select>
                </div>

                {/* 售价 */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    售价 (¥) <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className={`input-field ${errors.price ? 'border-red-300 focus:border-red-500 focus:ring-red-500' : ''}`}
                  />
                  {errors.price && (
                    <p className="mt-1 text-sm text-red-600">{errors.price}</p>
                  )}
                </div>
              </div>

              {/* 成本和利润率显示 */}
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">预估成本</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">¥{formData.cost.toFixed(2)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <DollarSign className="w-4 h-4" />
                      <span className="text-sm">售价</span>
                    </div>
                    <p className="text-lg font-semibold text-gray-900">¥{formData.price.toFixed(2)}</p>
                  </div>
                  <div>
                    <div className="flex items-center justify-center gap-1 text-gray-600 mb-1">
                      <span className="text-sm">利润率</span>
                    </div>
                    <p className={`text-lg font-semibold ${
                      parseFloat(profitMargin) > 60 ? 'text-green-600' : 
                      parseFloat(profitMargin) > 40 ? 'text-yellow-600' : 'text-red-600'
                    }`}>
                      {profitMargin}%
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* 步骤2: 原料配比 */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">原料配比</h3>
                <button
                  onClick={addIngredient}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加原料
                </button>
              </div>

              {errors.ingredients && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.ingredients}</p>
                </div>
              )}

              <div className="space-y-4">
                {formData.ingredients.map((ingredient, index) => (
                  <div key={ingredient.id} className="bg-gray-50 rounded-lg p-4">
                    <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                      {/* 原料名称 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          原料名称
                        </label>
                        <input
                          type="text"
                          value={ingredient.name}
                          onChange={(e) => updateIngredient(ingredient.id, 'name', e.target.value)}
                          className="input-field"
                          placeholder="例如：白朗姆酒"
                        />
                      </div>

                      {/* 品牌 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          品牌
                        </label>
                        <input
                          type="text"
                          value={ingredient.brand}
                          onChange={(e) => updateIngredient(ingredient.id, 'brand', e.target.value)}
                          className="input-field"
                          placeholder="例如：Bacardi"
                        />
                      </div>

                      {/* 用量 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          用量
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.1"
                          value={ingredient.amount}
                          onChange={(e) => updateIngredient(ingredient.id, 'amount', parseFloat(e.target.value) || 0)}
                          className="input-field"
                        />
                      </div>

                      {/* 单位 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          单位
                        </label>
                        <select
                          value={ingredient.unit}
                          onChange={(e) => updateIngredient(ingredient.id, 'unit', e.target.value)}
                          className="input-field"
                        >
                          {units.map(unit => (
                            <option key={unit} value={unit}>{unit}</option>
                          ))}
                        </select>
                      </div>

                      {/* 成本 */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">
                          成本 (¥)
                        </label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={ingredient.cost}
                          onChange={(e) => updateIngredient(ingredient.id, 'cost', parseFloat(e.target.value) || 0)}
                          className="input-field"
                        />
                      </div>

                      {/* 删除按钮 */}
                      <div className="flex items-end">
                        <button
                          onClick={() => removeIngredient(ingredient.id)}
                          className="p-2 text-red-600 hover:text-red-800 hover:bg-red-50 rounded-lg transition-colors"
                          title="删除原料"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {formData.ingredients.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">还没有添加任何原料</p>
                  <button
                    onClick={addIngredient}
                    className="btn-primary"
                  >
                    添加第一个原料
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 步骤3: 制作步骤 */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900">制作步骤</h3>
                <button
                  onClick={addInstruction}
                  className="btn-primary flex items-center gap-2"
                >
                  <Plus className="w-4 h-4" />
                  添加步骤
                </button>
              </div>

              {errors.instructions && (
                <div className="flex items-center gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <p className="text-sm text-red-600">{errors.instructions}</p>
                </div>
              )}

              <div className="space-y-3">
                {formData.instructions.map((instruction, index) => (
                  <div key={index} className="flex gap-3">
                    <div className="w-8 h-8 bg-primary-500 text-white rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 mt-1">
                      {index + 1}
                    </div>
                    <div className="flex-1">
                      <textarea
                        value={instruction}
                        onChange={(e) => updateInstruction(index, e.target.value)}
                        className="input-field"
                        rows={2}
                        placeholder={`第${index + 1}步制作说明...`}
                      />
                    </div>
                    <div className="flex flex-col gap-1">
                      {index > 0 && (
                        <button
                          onClick={() => moveInstruction(index, index - 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="上移"
                        >
                          <Move className="w-4 h-4 rotate-180" />
                        </button>
                      )}
                      {index < formData.instructions.length - 1 && (
                        <button
                          onClick={() => moveInstruction(index, index + 1)}
                          className="p-1 text-gray-400 hover:text-gray-600 rounded"
                          title="下移"
                        >
                          <Move className="w-4 h-4" />
                        </button>
                      )}
                      <button
                        onClick={() => removeInstruction(index)}
                        className="p-1 text-red-600 hover:text-red-800 rounded"
                        title="删除步骤"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>

              {formData.instructions.length === 0 && (
                <div className="text-center py-8">
                  <p className="text-gray-500 mb-4">还没有添加任何制作步骤</p>
                  <button
                    onClick={addInstruction}
                    className="btn-primary"
                  >
                    添加第一个步骤
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* 模态框底部 */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200">
          <div className="flex gap-2">
            <button
              onClick={resetForm}
              className="btn-secondary flex items-center gap-2"
            >
              <RotateCcw className="w-4 h-4" />
              重置
            </button>
          </div>

          <div className="flex gap-3">
            {currentStep > 1 && (
              <button
                onClick={() => setCurrentStep(prev => prev - 1)}
                className="btn-secondary"
              >
                上一步
              </button>
            )}
            
            {currentStep < 3 ? (
              <button
                onClick={() => setCurrentStep(prev => prev + 1)}
                disabled={isSaving}
                className="btn-primary"
              >
                下一步
              </button>
            ) : (
              <button
                onClick={handleSave}
                disabled={isLoading || isSaving}
                className="btn-primary flex items-center gap-2"
              >
                {isLoading ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Save className="w-4 h-4" />
                )}
                {isLoading ? '保存中...' : '保存配方'}
              </button>
            )}
            
            <button
              onClick={onClose}
              disabled={isSaving}
              className="btn-secondary"
            >
              取消
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CreateRecipeModal;