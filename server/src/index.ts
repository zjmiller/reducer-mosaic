import { createFactoredEvaluationRun } from "./create-factored-evaluation-run";
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

  await createFactoredEvaluationRun();

  startServer(topLevelScheduler);

  return;
}

main();
