import Sequelize from "sequelize";
import {
  BelongsTo,
  Column,
  ForeignKey,
  Model,
  Table,
} from "sequelize-typescript";

import { Run } from "./run";
import { User } from "./user";

@Table
export class Interaction extends Model<Interaction> {
  @Column({
    type: Sequelize.UUIDV4,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
  })
  public id: string;

  // a script can use this to uniquely identify
  // the interaction within its state
  @Column(Sequelize.INTEGER)
  public internalScriptReference: number;

  @Column({
    type: Sequelize.INTEGER,
    allowNull: false,
  })
  public startTimestamp: number;

  @Column(Sequelize.INTEGER)
  public endTimestamp: number;

  // not used yet
  @Column(Sequelize.JSON)
  public template: JSON;

  // not used yet
  @Column(Sequelize.JSON)
  public reply: JSON;

  @ForeignKey(() => Run)
  @Column(Sequelize.UUID)
  public runId: string;

  @BelongsTo(() => Run)
  public run: Run;

  @ForeignKey(() => User)
  @Column(Sequelize.UUID)
  public userId: string;

  @BelongsTo(() => User)
  public user: User;
}
