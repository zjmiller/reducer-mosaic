import { WorkspaceTemplate } from "../script-registry/basic-decomposition-script/workspace";
import { FactoredEvaluationWorkspaceTemplate } from "../script-registry/factored-evaluation-script/workspace";

// This will become a union type as more templates are added
export type Template = WorkspaceTemplate | FactoredEvaluationWorkspaceTemplate;

export type MaybeTemplate = Template | null;
