import { TrivialRunLevelScheduler } from "./run-level-scheduler-registry/trivial-run-level-scheduler";
import { RunRepository } from "./run/run-repository";
import { ScriptRepository as EstimationScriptRepository } from "./script-registry/estimation-script/repository";

export const createEstimationRun = async () => {
  const estimationScript = await EstimationScriptRepository.create({
    initialSetupData: {
      depthLimit: 3,
      initialQuestions: [],
      reviewers: [],
    },
  });

  // const factoredEvaluationScript = await FactoredEvaluationScriptRepository.findByPk(
  //   "",
  // );

  const trivialRunLevelScheduler = new TrivialRunLevelScheduler(
    estimationScript,
  );

  return await RunRepository.create(estimationScript, trivialRunLevelScheduler);

  // return await RunRepository.findRunByPk(
  //   "4b04e1f9-6e07-4cca-a017-a0de1f1f681a",
  // );
};
