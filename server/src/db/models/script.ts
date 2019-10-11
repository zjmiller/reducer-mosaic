import Sequelize from "sequelize";
import { Column, HasMany, Model, Table } from "sequelize-typescript";

import { Action } from "./action";

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
    type: Sequelize.STRING,
    allowNull: false,
  })
  public scriptType: string;

  @Column({
    type: Sequelize.JSON,
    allowNull: false,
  })
  public setupData: any;

  @HasMany(() => Action)
  public actions: Action[];
}
