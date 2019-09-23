import { TrivialRunLevelScheduler } from "./run-level-scheduler-registry/trivial-run-level-scheduler";
import { RunRepository } from "./run/run-repository";
import { FactoredEvaluationScriptRepository } from "./script-registry/factored-evaluation-script/script-repository";

export const createFactoredEvaluationRun = async () => {
  const factoredEvaluationScript = await FactoredEvaluationScriptRepository.create(
    {
      experts: {
        honest: ["a75b3cb2-2f57-4068-afaa-1c432ee8a78c"],
        malicious: ["a75b3cb2-2f57-4068-afaa-1c432ee8a78c"],
      },
    },
  );

  // const factoredEvaluationScript = await FactoredEvaluationScriptRepository.findByPk(
  //   "",
  // );

  const trivialRunLevelScheduler = new TrivialRunLevelScheduler(
    factoredEvaluationScript,
  );

  return await RunRepository.create(
    factoredEvaluationScript,
    trivialRunLevelScheduler,
  );

  // return await RunRepository.findRunByPk(
  //   "4b04e1f9-6e07-4cca-a017-a0de1f1f681a",
  // );
};
