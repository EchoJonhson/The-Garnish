// 导入所有模型
import User from './User';
import Product from './Product';
import Recipe from './Recipe';
import RecipeLine from './RecipeLine';
import Order from './Order';
import OrderLine from './OrderLine';
import InventoryLedger from './InventoryLedger';
import sequelize from '../config/database';

// 导出所有模型
export {
  User,
  Product,
  Recipe,
  RecipeLine,
  Order,
  OrderLine,
  InventoryLedger,
  sequelize
};

// 初始化数据库连接和模型同步
export const initDatabase = async (): Promise<void> => {
  try {
    // 测试数据库连接
    await sequelize.authenticate();
    console.log('数据库连接成功');

    // 同步所有模型到数据库
    await sequelize.sync({ force: false });
    console.log('数据库模型同步完成');
  } catch (error) {
    console.error('数据库初始化失败:', error);
    throw error;
  }
};

// 创建种子数据
export const seedDatabase = async (): Promise<void> => {
  try {
    // 检查是否已有管理员用户
    const adminUser = await User.findOne({ where: { username: 'admin' } });
    
    if (!adminUser) {
      // 创建默认管理员用户
      const hashedPassword = await User.hashPassword('admin123');
      const admin = await User.create({
        username: 'admin',
        password_hash: hashedPassword,
        name: '系统管理员',
        role: 'owner'
      });
      console.log('默认管理员用户创建成功');

      // 创建基础产品数据
      const products = await Product.bulkCreate([
        {
          name: '威士忌',
          brand: 'Jack Daniels',
          category: '基酒',
          size_ml: 750.00,
          unit_cost_per_ml: 0.08,
          current_stock_ml: 3000.00,
          warning_level: 1500.00
        },
        {
          name: '伏特加',
          brand: 'Absolut',
          category: '基酒',
          size_ml: 750.00,
          unit_cost_per_ml: 0.06,
          current_stock_ml: 2250.00,
          warning_level: 1500.00
        },
        {
          name: '朗姆酒',
          brand: 'Bacardi',
          category: '基酒',
          size_ml: 750.00,
          unit_cost_per_ml: 0.07,
          current_stock_ml: 1500.00,
          warning_level: 1500.00
        },
        {
          name: '金酒',
          brand: 'Bombay',
          category: '基酒',
          size_ml: 750.00,
          unit_cost_per_ml: 0.09,
          current_stock_ml: 2250.00,
          warning_level: 1500.00
        },
        {
          name: '柠檬汁',
          brand: '鲜榨',
          category: '辅料',
          size_ml: 1000.00,
          unit_cost_per_ml: 0.01,
          current_stock_ml: 2000.00,
          warning_level: 500.00
        },
        {
          name: '糖浆',
          brand: '自制',
          category: '辅料',
          size_ml: 500.00,
          unit_cost_per_ml: 0.005,
          current_stock_ml: 1000.00,
          warning_level: 250.00
        }
      ]);
      console.log('基础产品数据创建成功');

      // 创建示例配方
      const oldFashioned = await Recipe.create({
        name: 'Old Fashioned',
        description: '经典威士忌鸡尾酒',
        selling_price: 68.00,
        cost_price: 0, // 将在配方行创建后计算
        created_by: admin.id
      });

      const mojito = await Recipe.create({
        name: 'Mojito',
        description: '古巴经典朗姆酒鸡尾酒',
        selling_price: 58.00,
        cost_price: 0, // 将在配方行创建后计算
        created_by: admin.id
      });

      // 创建配方行数据
      await RecipeLine.bulkCreate([
        {
          recipe_id: oldFashioned.id,
          product_id: products[0].id, // 威士忌
          quantity_ml: 60.0,
          notes: '威士忌基酒'
        },
        {
          recipe_id: oldFashioned.id,
          product_id: products[5].id, // 糖浆
          quantity_ml: 10.0,
          notes: '糖浆调味'
        },
        {
          recipe_id: mojito.id,
          product_id: products[2].id, // 朗姆酒
          quantity_ml: 50.0,
          notes: '朗姆酒基酒'
        },
        {
          recipe_id: mojito.id,
          product_id: products[4].id, // 柠檬汁
          quantity_ml: 20.0,
          notes: '柠檬汁'
        },
        {
          recipe_id: mojito.id,
          product_id: products[5].id, // 糖浆
          quantity_ml: 15.0,
          notes: '糖浆'
        }
      ]);

      // 计算并更新配方成本
      const oldFashionedCost = (60.0 * 0.08) + (10.0 * 0.005); // 威士忌 + 糖浆
      const mojitoCost = (50.0 * 0.07) + (20.0 * 0.01) + (15.0 * 0.005); // 朗姆酒 + 柠檬汁 + 糖浆
      
      await oldFashioned.update({ cost_price: oldFashionedCost });
      await mojito.update({ cost_price: mojitoCost });

      console.log('示例配方数据创建成功');
    } else {
      console.log('种子数据已存在，跳过创建');
    }
  } catch (error) {
    console.error('种子数据创建失败:', error);
    throw error;
  }
};

// 默认导出数据库实例
export default sequelize;