import { BasicDecompositionScriptState } from "../script-registry/basic-decomposition-script";

import { FactoredEvaluationScriptState } from "../script-registry/factored-evaluation-script";

export type ScriptState =
  | BasicDecompositionScriptState
  | FactoredEvaluationScriptState;
