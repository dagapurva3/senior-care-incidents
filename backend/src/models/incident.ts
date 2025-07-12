import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

interface IncidentAttributes {
  id: string;
  userId: string;
  type: string;
  description: string;
  summary?: string;
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

interface IncidentCreationAttributes extends Optional<IncidentAttributes, 'id' | 'createdAt' | 'updatedAt'> {}

class Incident extends Model implements IncidentAttributes {
  public id!: string;
  public userId!: string;
  public type!: string;
  public description!: string;
  public summary?: string;
  public status!: string;
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
    },
    type: {
      type: DataTypes.STRING,
      allowNull: false,
      validate: {
        isIn: [["fall", "behaviour", "medication", "other"]],
      },
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
      validate: {
        len: [10, 2000], // Minimum 10 characters, maximum 2000
      },
    },
    summary: {
      type: DataTypes.TEXT,
      allowNull: true,
    },
    status: {
      type: DataTypes.STRING,
      allowNull: false,
      defaultValue: "open",
      validate: {
        isIn: [["open", "in_progress", "resolved", "closed"]],
      },
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

export default Incident;
