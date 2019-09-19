import Sequelize from "sequelize";
import { Column, Model, Table } from "sequelize-typescript";

@Table
export class User extends Model<User> {
  @Column({
    type: Sequelize.UUIDV4,
    primaryKey: true,
    defaultValue: Sequelize.UUIDV4,
    allowNull: false,
  })
  public id: string;

  @Column({
    type: Sequelize.STRING,
  })
  public name: string;
}
