import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import User from './User';

// 订单属性接口
interface OrderAttributes {
  id: number;
  order_number: string;
  created_by: number;
  status: 'pending' | 'completed' | 'cancelled';
  total_amount: number;
  total_cost: number;
  created_at: Date;
  completed_at?: Date;
}

// 创建订单时的可选属性
interface OrderCreationAttributes extends Optional<OrderAttributes, 'id' | 'status' | 'created_at' | 'completed_at'> {}

// 订单模型类
class Order extends Model<OrderAttributes, OrderCreationAttributes> implements OrderAttributes {
  public id!: number;
  public order_number!: string;
  public created_by!: number;
  public status!: 'pending' | 'completed' | 'cancelled';
  public total_amount!: number;
  public total_cost!: number;
  public readonly created_at!: Date;
  public completed_at?: Date;

  // 计算毛利率
  public getMarginPercent(): number {
    if (this.total_amount === 0) return 0;
    return ((this.total_amount - this.total_cost) / this.total_amount) * 100;
  }

  // 计算毛利额
  public getMarginAmount(): number {
    return this.total_amount - this.total_cost;
  }

  // 完成订单
  public async completeOrder(): Promise<void> {
    this.status = 'completed';
    this.completed_at = new Date();
    await this.save();
  }

  // 取消订单
  public async cancelOrder(): Promise<void> {
    this.status = 'cancelled';
    await this.save();
  }

  // 生成订单号
  public static generateOrderNumber(): string {
    const now = new Date();
    const timestamp = now.getTime().toString().slice(-8);
    const random = Math.floor(Math.random() * 1000).toString().padStart(3, '0');
    return `ORD${timestamp}${random}`;
  }
}

// 定义订单模型
Order.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    order_number: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
    },
    created_by: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
    },
    status: {
      type: DataTypes.ENUM('pending', 'completed', 'cancelled'),
      allowNull: false,
      defaultValue: 'pending',
    },
    total_amount: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    total_cost: {
      type: DataTypes.DECIMAL(10, 2),
      allowNull: false,
      validate: {
        min: 0,
      },
    },
    created_at: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: DataTypes.NOW,
    },
    completed_at: {
      type: DataTypes.DATE,
      allowNull: true,
    },
  },
  {
    sequelize,
    modelName: 'Order',
    tableName: 'orders',
    timestamps: false,
    indexes: [
      {
        fields: ['created_at'],
      },
      {
        unique: true,
        fields: ['order_number'],
      },
    ],
  }
);

// 定义关联关系
Order.belongsTo(User, {
  foreignKey: 'created_by',
  as: 'creator',
});

User.hasMany(Order, {
  foreignKey: 'created_by',
  as: 'orders',
});

export default Order;