import Sequelize from "sequelize";
import {
  BelongsTo,
  ForeignKey,
  Column,
  Model,
  Table,
} from "sequelize-typescript";

import { Script } from "./script";

@Table
export class Run extends Model<Run> {
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
}
