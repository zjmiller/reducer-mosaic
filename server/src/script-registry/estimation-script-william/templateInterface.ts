import { FormalQuestion } from "./types";

export type GeneratorData = {
  prompt: string;
}

export type GeneratorTemplate = {
  templateIdentifier: "generator_template";
  templateData: {
    prompt: string;
    questionsPerPrompt: number;
  }
}

export type FormalizationTemplate = {
  templateIdentifier: "formalization_template";
  templateData: {
    naturalQuestion: string;
    response?: FormalizationReply;
    propertyOptions: string[];
  };
}

export type DecomposerTemplate = {
  templateIdentifier: "decomposition_template";
  templateData: {
    question: FormalQuestion;
    depth: number;
    response?: DecomposerReply;
    propertyOptions: string[];
  };
}

export type GeneratorReply =
  | { replyType: "InitialQuestions"; questions: string[] };

export type FormalizationData = {
  naturalQuestion: string;
}

export type FormalizationReply =
  | { replyType: "FormalQuestion"; question: FormalQuestion; comments: string }
  | { replyType: "InvalidQuestion"; comments: string };

export type DecomposerData = {
  question: FormalQuestion;
  depth: number;
};

export type DecomposerReply =
  | { replyType: "Decomposition"; subquestions: FormalQuestion[]; aggregation: string; comments: string }
  | { replyType: "Answer"; comments: string }
  | { replyType: "InvalidQuestion"; comments: string }

export type Reply =
  | GeneratorReply
  | DecomposerReply
  | FormalizationReply;

export type Template =
  | GeneratorTemplate
  | FormalizationTemplate
  | DecomposerTemplate;

export type WorkspaceData =
  | GeneratorData
  | FormalizationData
  | DecomposerData;
