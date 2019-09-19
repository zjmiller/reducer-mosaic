import { Run } from "./run";
import { TrivialRunLevelScheduler } from "./run-level-scheduler-registry//trivial-run-level-scheduler";
import { BasicDecompositionScript } from "./script-registry/basic-decomposition-script";

export const createBasicDecompRun = () => {
  const basicDecompositionScript = new BasicDecompositionScript();

  const trivialRunLevelScheduler = new TrivialRunLevelScheduler(
    basicDecompositionScript,
  );

  new Run(basicDecompositionScript, trivialRunLevelScheduler);
};
