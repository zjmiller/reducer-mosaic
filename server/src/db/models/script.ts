import Sequelize from "sequelize";
import { Column, Model, Table } from "sequelize-typescript";

@Table
export class Script extends Model<Script> {
  @Column({
    type: Sequelize.UUIDV4,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
  })
  public id: string;

  @Column({
    type: Sequelize.STRING,
    allowNull: false,
  })
  public randomSeedString: string;

  @Column({
    type: Sequelize.JSON,
    allowNull: false,
  })
  public initialState: any;

  @Column({
    type: Sequelize.JSON,
    allowNull: false,
  })
  public actions: any[];
}
