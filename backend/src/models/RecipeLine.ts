import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Recipe from './Recipe';
import Product from './Product';

// 配方行属性接口
interface RecipeLineAttributes {
  id: number;
  recipe_id: number;
  product_id: number;
  quantity_ml: number;
  notes?: string;
}

// 创建配方行时的可选属性
interface RecipeLineCreationAttributes extends Optional<RecipeLineAttributes, 'id' | 'notes'> {}

// 配方行模型类
class RecipeLine extends Model<RecipeLineAttributes, RecipeLineCreationAttributes> implements RecipeLineAttributes {
  public id!: number;
  public recipe_id!: number;
  public product_id!: number;
  public quantity_ml!: number;
  public notes?: string;

  // 关联的产品信息
  public Product?: Product;

  // 计算该行的成本
  public async getLineCost(): Promise<number> {
    if (!this.Product) {
      const product = await Product.findByPk(this.product_id);
      if (!product) return 0;
      return this.quantity_ml * product.unit_cost_per_ml;
    }
    return this.quantity_ml * this.Product.unit_cost_per_ml;
  }
}

// 定义配方行模型
RecipeLine.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    recipe_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Recipe,
        key: 'id',
      },
    },
    product_id: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: Product,
        key: 'id',
      },
    },
    quantity_ml: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0.01,
      },
    },
    notes: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'RecipeLine',
    tableName: 'recipe_lines',
    timestamps: false,
    indexes: [
      {
        fields: ['recipe_id'],
      },
    ],
  }
);

// 定义关联关系
RecipeLine.belongsTo(Recipe, {
  foreignKey: 'recipe_id',
  as: 'recipe',
});

RecipeLine.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

Recipe.hasMany(RecipeLine, {
  foreignKey: 'recipe_id',
  as: 'lines',
});

Product.hasMany(RecipeLine, {
  foreignKey: 'product_id',
  as: 'recipe_lines',
});

export default RecipeLine;