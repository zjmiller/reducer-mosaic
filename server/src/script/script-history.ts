import { BasicDecompositionScriptHistory } from "../script-registry/basic-decomposition-script";

import { FactoredEvaluationScriptHistory } from "../script-registry/factored-evaluation-script";

export type ScriptHistory =
  | BasicDecompositionScriptHistory
  | FactoredEvaluationScriptHistory;
