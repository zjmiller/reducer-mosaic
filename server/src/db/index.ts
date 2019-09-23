import { Sequelize } from "sequelize-typescript";
import sqlite3 from "sqlite3";

import { Run } from "./models/run";
import { Script } from "./models/script";
import { User } from "./models/user";

export const db = new sqlite3.Database("./db.sqlite");

export const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: "./db.sqlite",
});

export async function ensureDbInitialized() {
  await sequelize.authenticate();
}

export async function setupDBTables(
  { force }: { force: boolean } = { force: false },
) {
  await sequelize.addModels([Run, Script, User]);
  await Run.sync({ force });
  await Script.sync({ force });
  await User.sync({ force });
}
