import { BasicDecompositionScriptHistory } from "../script-registry/basic-decomposition-script";

import { FactoredEvaluationScriptHistory } from "../script-registry/factored-evaluation-script";

import { IHistory } from "../script-registry/estimation-script/types";

export type ScriptHistory =
  | BasicDecompositionScriptHistory
  | FactoredEvaluationScriptHistory
  | IHistory;
