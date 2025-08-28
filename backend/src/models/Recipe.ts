import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// 配方属性接口
interface RecipeAttributes {
  id: number;
  name: string;
  description?: string;
  selling_price: number;
  cost_price: number;
  created_by: number;
  created_at: Date;
  updated_at: Date;
}

// 创建配方时的可选属性
interface RecipeCreationAttributes extends Optional<RecipeAttributes, 'id' | 'description' | 'cost_price' | 'created_at' | 'updated_at'> {}

// 配方模型类
class Recipe extends Model<RecipeAttributes, RecipeCreationAttributes> implements RecipeAttributes {
  public id!: number;
  public name!: string;
  public description?: string;
  public selling_price!: number;
  public cost_price!: number;
  public created_by!: number;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 计算毛利率
  public getMarginPercent(): number {
    if (this.selling_price === 0) return 0;
    return ((this.selling_price - this.cost_price) / this.selling_price) * 100;
  }

  // 计算毛利额
  public getMarginAmount(): number {
    return this.selling_price - this.cost_price;
  }

  // 更新成本价格
  public async updateCostPrice(newCostPrice: number): Promise<void> {
    this.cost_price = newCostPrice;
    await this.save();
  }
}

// 定义配方模型
Recipe.init(
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
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    selling_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    cost_price: {
      type: DataTypes.DECIMAL(10, 4),
      allowNull: false,
      defaultValue: 0,
      validate: {
        min: 0,
      },
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
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
    modelName: 'Recipe',
    tableName: 'recipes',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        fields: ['name'],
      },
    ],
  }
);

// 定义关联关系
Recipe.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

User.hasMany(Recipe, {
  foreignKey: 'created_by',
  as: 'recipes',
});

export default Recipe;