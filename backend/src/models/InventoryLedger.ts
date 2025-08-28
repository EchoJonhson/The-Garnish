import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import Product from './Product';
import User from './User';

// 库存流水属性接口
interface InventoryLedgerAttributes {
  id: number;
  product_id: number;
  quantity_ml: number;
  transaction_type: 'in' | 'out' | 'adjust';
  reason?: string;
  operator_id: number;
  created_at: Date;
}

// 创建库存流水时的可选属性
interface InventoryLedgerCreationAttributes extends Optional<InventoryLedgerAttributes, 'id' | 'reason' | 'created_at'> {}

// 库存流水模型类
class InventoryLedger extends Model<InventoryLedgerAttributes, InventoryLedgerCreationAttributes> implements InventoryLedgerAttributes {
  public id!: number;
  public product_id!: number;
  public quantity_ml!: number;
  public transaction_type!: 'in' | 'out' | 'adjust';
  public reason?: string;
  public operator_id!: number;
  public readonly created_at!: Date;

  // 关联的产品和操作员信息
  public Product?: Product;
  public Operator?: User;

  // 获取交易类型的中文描述
  public getTransactionTypeText(): string {
    const typeMap = {
      'in': '入库',
      'out': '出库',
      'adjust': '调整'
    };
    return typeMap[this.transaction_type] || '未知';
  }

  // 是否为正向交易（增加库存）
  public isPositiveTransaction(): boolean {
    return this.transaction_type === 'in' || 
           (this.transaction_type === 'adjust' && this.quantity_ml > 0);
  }

  // 是否为负向交易（减少库存）
  public isNegativeTransaction(): boolean {
    return this.transaction_type === 'out' || 
           (this.transaction_type === 'adjust' && this.quantity_ml < 0);
  }

  // 获取绝对数量
  public getAbsoluteQuantity(): number {
    return Math.abs(this.quantity_ml);
  }
}

// 定义库存流水模型
InventoryLedger.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
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
      comment: '数量（毫升），正数表示增加，负数表示减少',
    },
    transaction_type: {
      type: DataTypes.ENUM('in', 'out', 'adjust'),
      allowNull: false,
      comment: 'in=入库, out=出库, adjust=调整',
    },
    reason: {
      type: DataTypes.STRING(200),
      allowNull: true,
      comment: '操作原因说明',
    },
    operator_id: {
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
  },
  {
    sequelize,
    modelName: 'InventoryLedger',
    tableName: 'inventory_ledger',
    timestamps: false,
    indexes: [
      {
        fields: ['product_id'],
      },
      {
        fields: ['created_at'],
      },
      {
        fields: ['transaction_type'],
      },
    ],
  }
);

// 定义关联关系
InventoryLedger.belongsTo(Product, {
  foreignKey: 'product_id',
  as: 'product',
});

InventoryLedger.belongsTo(User, {
  foreignKey: 'operator_id',
  as: 'operator',
});

Product.hasMany(InventoryLedger, {
  foreignKey: 'product_id',
  as: 'inventory_ledgers',
});

User.hasMany(InventoryLedger, {
  foreignKey: 'operator_id',
  as: 'inventory_operations',
});

export default InventoryLedger;