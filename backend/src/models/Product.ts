import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';

// 产品属性接口
interface ProductAttributes {
  id: number;
  name: string;
  brand?: string;
  category: string;
  size_ml: number;
  unit_cost_per_ml: number;
  current_stock_ml: number;
  warning_level: number;
  created_at: Date;
  updated_at: Date;
}

// 创建产品时的可选属性
interface ProductCreationAttributes extends Optional<ProductAttributes, 'id' | 'brand' | 'current_stock_ml' | 'warning_level' | 'created_at' | 'updated_at'> {}

// 产品模型类
class Product extends Model<ProductAttributes, ProductCreationAttributes> implements ProductAttributes {
  public id!: number;
  public name!: string;
  public brand?: string;
  public category!: string;
  public size_ml!: number;
  public unit_cost_per_ml!: number;
  public current_stock_ml!: number;
  public warning_level!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 检查库存是否低于预警线
  public isLowStock(): boolean {
    return this.current_stock_ml <= this.warning_level;
  }

  // 计算总库存价值
  public getStockValue(): number {
    return this.current_stock_ml * this.unit_cost_per_ml;
  }

  // 更新库存
  public async updateStock(quantity_ml: number, transaction_type: 'in' | 'out' | 'adjust'): Promise<void> {
    if (transaction_type === 'in' || transaction_type === 'adjust') {
      this.current_stock_ml += quantity_ml;
    } else if (transaction_type === 'out') {
      this.current_stock_ml -= quantity_ml;
      if (this.current_stock_ml < 0) {
        this.current_stock_ml = 0;
      }
    }
    await this.save();
  }
}

// 定义产品模型
Product.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
      validate: {
        len: [1, 200],
        notEmpty: true,
      },
    },
    brand: {
      type: DataTypes.STRING(100),
      allowNull: true,
    },
    category: {
      type: DataTypes.STRING(50),
      allowNull: false,
      validate: {
        len: [1, 50],
        notEmpty: true,
      },
    },
    size_ml: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    unit_cost_per_ml: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      validate: {
        min: 0.0001,
      },
    },
    current_stock_ml: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    warning_level: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    updated_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
  },
  {
    sequelize,
    modelName: 'Product',
    tableName: 'products',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['category'],
      },
      {
        fields: ['current_stock_ml'],
      },
    ],
  }
);

export default Product;