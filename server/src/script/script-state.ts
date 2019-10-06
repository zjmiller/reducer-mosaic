import { BasicDecompositionScriptState } from "../script-registry/basic-decomposition-script";

import { FactoredEvaluationScriptState } from "../script-registry/factored-evaluation-script";

import { IState } from "../script-registry/estimation-script/types";

export type ScriptState =
  | BasicDecompositionScriptState
  | FactoredEvaluationScriptState
  | IState;
