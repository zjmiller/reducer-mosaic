import { createEstimationRun } from "./create-estimation-run";
import { ensureDbInitialized, setupDBTables } from "./db";
import { startServer } from "./graph-ql-server";
import { TopLevelScheduler } from "./top-level-scheduler";
import { UserRepository } from "./user/user-repository";

async function main(): Promise<undefined> {
  await ensureDbInitialized();
  await setupDBTables();

  const topLevelScheduler = new TopLevelScheduler();

  // create 50 users
  let i = 0;
  while (i++ < 50) {
    try {
      await UserRepository.findUserByEmail(`${i}@email.com`);
    } catch (e) {
      await UserRepository.create({
        email: `${i}@email.com`,
      });
    }
  }

  await createEstimationRun();

  await startServer(topLevelScheduler);

  const u1 = await UserRepository.findUserByEmail(`1@email.com`);

  if (!u1) {
    throw Error("");
  }

  const template = topLevelScheduler.findWorkForUser(u1);

  console.log(template);

  return;
}

main();
