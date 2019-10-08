import { WorkspaceTemplate } from "../script-registry/basic-decomposition-script/workspace";
import { Template as EstimationTemplate } from "../script-registry/estimation-script/types";
import { FactoredEvaluationWorkspaceTemplate } from "../script-registry/factored-evaluation-script/generate-template";
// This will become a union type as more templates are added
export type Template =
  | WorkspaceTemplate
  | FactoredEvaluationWorkspaceTemplate
  | EstimationTemplate;

export type MaybeTemplate = Template | null;
