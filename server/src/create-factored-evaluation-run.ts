import { Run } from "./run";
import { TrivialRunLevelScheduler } from "./run-level-scheduler-registry/trivial-run-level-scheduler";
import { FactoredEvaluationScriptRepository } from "./script-registry/factored-evaluation-script/script-repository";

export const createFactoredEvaluationRun = async () => {
  // const factoredEvaluationScript = await FactoredEvaluationScriptRepository.create(
  //   {
  //     experts: {
  //       honest: ["a75b3cb2-2f57-4068-afaa-1c432ee8a78c"],
  //       malicious: ["a75b3cb2-2f57-4068-afaa-1c432ee8a78c"],
  //     },
  //   },
  // );

  const factoredEvaluationScript = await FactoredEvaluationScriptRepository.findByPk(
    "f86516ae-8ea0-4f2e-881c-67fc3e4a6ebd",
  );

  const trivialRunLevelScheduler = new TrivialRunLevelScheduler(
    factoredEvaluationScript,
  );

  new Run(factoredEvaluationScript, trivialRunLevelScheduler);
};
