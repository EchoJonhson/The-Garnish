import { DataTypes, Model, Optional } from 'sequelize';
import sequelize from '../config/database';
import bcrypt from 'bcryptjs';

// 用户属性接口
interface UserAttributes {
  id: number;
  username: string;
  password_hash: string;
  name: string;
  role: 'owner' | 'bartender';
  is_active: boolean;
  created_at: Date;
  updated_at: Date;
}

// 创建用户时的可选属性
interface UserCreationAttributes extends Optional<UserAttributes, 'id' | 'is_active' | 'created_at' | 'updated_at'> {}

// 用户模型类
class User extends Model<UserAttributes, UserCreationAttributes> implements UserAttributes {
  public id!: number;
  public username!: string;
  public password_hash!: string;
  public name!: string;
  public role!: 'owner' | 'bartender';
  public is_active!: boolean;
  public readonly created_at!: Date;
  public readonly updated_at!: Date;

  // 验证密码方法
  public async validatePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password_hash);
  }

  // 静态方法：创建用户时加密密码
  public static async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }
}

// 定义用户模型
User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    username: {
      type: DataTypes.STRING(50),
      allowNull: false,
      unique: true,
      validate: {
        len: [3, 50],
        notEmpty: true,
      },
    },
    password_hash: {
      type: DataTypes.STRING(255),
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(100),
      allowNull: false,
      validate: {
        len: [1, 100],
        notEmpty: true,
      },
    },
    role: {
      type: DataTypes.ENUM('owner', 'bartender'),
      allowNull: false,
      defaultValue: 'bartender',
    },
    is_active: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: true,
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
    modelName: 'User',
    tableName: 'users',
    timestamps: true,
    createdAt: 'created_at',
    updatedAt: 'updated_at',
    indexes: [
      {
        unique: true,
        fields: ['username'],
      },
    ],
  }
);

export default User;