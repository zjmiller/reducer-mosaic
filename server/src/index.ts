import { createFactoredEvaluationRun } from "./create-factored-evaluation-run";
import { ensureDbInitialized, setupDBTables } from "./db";
import { startServer } from "./graph-ql-server";
import { TopLevelScheduler } from "./top-level-scheduler";
import { UserRepository } from "./user/user-repository";

const topLevelScheduler = new TopLevelScheduler();

async function main(): Promise<undefined> {
  await ensureDbInitialized();
  await setupDBTables();

  // create guest user if it's not in db
  try {
    await UserRepository.findUserByPk("a75b3cb2-2f57-4068-afaa-1c432ee8a78c");
  } catch (e) {
    await UserRepository.create({
      id: "a75b3cb2-2f57-4068-afaa-1c432ee8a78c",
    });
  }

  createFactoredEvaluationRun();

  startServer(topLevelScheduler);

  return;
}

main();
