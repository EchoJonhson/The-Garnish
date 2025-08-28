import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Order from './Order';
import Recipe from './Recipe';

// 订单行属性接口
interface OrderLineAttributes {
  id: number;
  order_id: number;
  recipe_id: number;
  quantity: number;
  unit_price: number;
  unit_cost: number;
  ingredient_overrides?: string; // JSON字符串，存储基酒替换信息
  notes?: string;
}

// 创建订单行时的可选属性
interface OrderLineCreationAttributes extends Optional<OrderLineAttributes, 'id' | 'ingredient_overrides' | 'notes'> {}

// 基酒替换接口
interface IngredientOverride {
  original_product_id: number;
  new_product_id: number;
  quantity_ml: number;
}

// 订单行模型类
class OrderLine extends Model<OrderLineAttributes, OrderLineCreationAttributes> implements OrderLineAttributes {
  public id!: number;
  public order_id!: number;
  public recipe_id!: number;
  public quantity!: number;
  public unit_price!: number;
  public unit_cost!: number;
  public ingredient_overrides?: string;
  public notes?: string;

  // 关联的配方信息
  public Recipe?: Recipe;

  // 计算该行的总价
  public getLineTotal(): number {
    return this.quantity * this.unit_price;
  }

  // 计算该行的总成本
  public getLineCost(): number {
    return this.quantity * this.unit_cost;
  }

  // 计算该行的毛利
  public getLineMargin(): number {
    return this.getLineTotal() - this.getLineCost();
  }

  // 获取基酒替换信息
  public getIngredientOverrides(): IngredientOverride[] {
    if (!this.ingredient_overrides) return [];
    try {
      return JSON.parse(this.ingredient_overrides);
    } catch {
      return [];
    }
  }

  // 设置基酒替换信息
  public setIngredientOverrides(overrides: IngredientOverride[]): void {
    this.ingredient_overrides = JSON.stringify(overrides);
  }

  // 检查是否有基酒替换
  public hasIngredientOverrides(): boolean {
    return this.getIngredientOverrides().length > 0;
  }
}

// 定义订单行模型
OrderLine.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Order,
        key: 'id',
      },
    },
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Recipe,
        key: 'id',
      },
    },
    quantity: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1,
      },
    },
    unit_price: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    unit_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    ingredient_overrides: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'OrderLine',
    tableName: 'order_lines',
    timestamps: false,
    indexes: [
      {
        fields: ['order_id'],
      },
    ],
  }
);

// 定义关联关系
OrderLine.belongsTo(Order, {
  foreignKey: 'order_id',
  as: 'order',
});

OrderLine.belongsTo(Recipe, {
  foreignKey: 'recipe_id',
  as: 'recipe',
});

Order.hasMany(OrderLine, {
  foreignKey: 'order_id',
  as: 'lines',
});

Recipe.hasMany(OrderLine, {
  foreignKey: 'recipe_id',
  as: 'order_lines',
});

export default OrderLine;
export type { IngredientOverride };