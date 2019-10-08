import { BasicDecompositionReply } from "../script-registry/basic-decomposition-script/reply";

import { FactoredEvaluationReply } from "../script-registry/factored-evaluation-script/reply";

import { Reply } from "../script-registry/estimation-script/types";

import { WillReply } from "../script-registry/estimation-script/types;

export type Reply = BasicDecompositionReply | FactoredEvaluationReply | Reply | WillReply;
