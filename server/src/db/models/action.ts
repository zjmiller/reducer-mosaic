import Sequelize from "sequelize";
import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";

import { Script } from "./script";

@Table
export class Action extends Model<Action> {
  @Column({
    type: Sequelize.UUIDV4,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
  })
  public id: string;

  @ForeignKey(() => Script)
  @Column(Sequelize.UUID)
  public scriptId: string;

  @BelongsTo(() => Script)
  public script: Script;

  @Column({
    type: Sequelize.INTEGER,
    allowNull: false,
  })
  public index: number;

  @Column({
    type: Sequelize.JSON,
    allowNull: false,
  })
  public content: any[];
}
