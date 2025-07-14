import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import User from "./user";

interface IncidentAttributes {
  id: string;
  userId: string;
  type: "fall" | "behaviour" | "medication" | "other";
  description: string;
  summary?: string;
  status: "open" | "in_progress" | "resolved" | "closed";
  createdAt: Date;
  updatedAt: Date;
}

interface IncidentCreationAttributes extends Optional<IncidentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Incident extends Model<IncidentAttributes, IncidentCreationAttributes> implements IncidentAttributes {
  public id!: string;
  public userId!: string;
  public type!: "fall" | "behaviour" | "medication" | "other";
  public description!: string;
  public summary?: string;
  public status!: "open" | "in_progress" | "resolved" | "closed";
  public createdAt!: Date;
  public updatedAt!: Date;
}

Incident.init(
  {
    id: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV4,
      primaryKey: true,
    },
    userId: {
      type: DataTypes.STRING,
      allowNull: false,
      references: {
        model: User,
        key: 'id',
      },
      onDelete: 'CASCADE',
    },
    type: {
      type: DataTypes.ENUM("fall", "behaviour", "medication", "other"),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 2000],
      },
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.ENUM("open", "in_progress", "resolved", "closed"),
      allowNull: false,
      defaultValue: "open",
    },
    createdAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
    updatedAt: {
      type: DataTypes.DATE,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "Incident",
    tableName: "incidents",
    timestamps: true,
  }
);

Incident.belongsTo(User, { foreignKey: 'userId', as: 'user' });

export default Incident;
