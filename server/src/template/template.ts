import { Template as EstimationTemplate } from "../script-registry/estimation-script/types";

// This will become a union type as more templates are added
export type Template = EstimationTemplate;

export type MaybeTemplate = Template | null;
