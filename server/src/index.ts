import { createEstimationRun } from "./create-estimation-run";
import { ensureDbInitialized, setupDBTables } from "./db/db";
import { startServer } from "./graph-ql-server/server";
import { TopLevelScheduler } from "./top-level-scheduler/top-level-scheduler";
import { UserRepository } from "./user/user-repository";

async function main(): Promise<undefined> {
  await ensureDbInitialized();
  await setupDBTables({ force: true });

  const topLevelScheduler = new TopLevelScheduler();

  // create 1 users
  let i = 0;
  while (i++ < 1) {
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

  return;
}

main();
