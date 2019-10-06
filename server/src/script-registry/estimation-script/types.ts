// CONTENT

export type Property =
  | "number"
  | "volume"
  | "mass"
  | "length"
  | "area"
  | "time"
  | "density"
  | "number / number"
  | "height"
  | "width"
  | "mass / mass"
  | "volume / time"
  | "money"
  | "number / time"
  | "force"
  | "energy"
  | "food calories"
  | "volume / volume"
  | "length / time"
  | "mass / time"
  | "number / area"
  | "length / length"
  | "food calories / mass"
  | "mass / volume"
  | "number / mass"
  | "time / time"
  | "number / volume"
  | "pressure"
  | "area / area"
  | "mass / money"
  | "money / energy"
  | "radius"
  | "volume / mass"
  | "force / mass"
  | "pressure / time"
  | "energy / time"
  | "energy / mass"
  | "volume / height"
  | "money / time"
  | "volume / number"
  | "length / time^2";

export type PropertyEntityQuestion = {
  property: Property;
  entity: string;
};

export type Aggregation =
  | "division"
  | "multiplication"
  | "addition"
  | "subtraction";

// ACTIONS and REPLIES

export type Action = ISetupAction | IAssignUserAction | IReplyAction;

export type EstimationAction = Action;

interface IInitialSetupData {
  reviewers: UserId[];
  depthLimit: number;
  initialQuestions: string[];
}

export type InitialSetupData = IInitialSetupData;

interface ISetupAction {
  actionType: "SETUP";
  initialSetupData: IInitialSetupData;
}

interface IAssignUserAction {
  actionType: "ASSIGN_USER";
  userId: string;
  workspaceId: number;
}

interface IReplyAction {
  actionType: "REPLY";
  workspaceId: number;
  reply: Reply;
}

export type Reply =
  | IGenerateQuestionsReply
  | IFormalizeQuestionReply
  | IReviewFormalizedQuestionReply
  | IDecomposeQuestionReply
  | IReviewDecomposedQuestionReply;

interface IGenerateQuestionsReply {
  replyType: "GENERATE_QUESTIONS";
  questions: string[];
}

interface IFormalizeQuestionReply {
  replyType: "FORMALIZE_QUESTION";
  isInvalid?: boolean;
  formalizedQuestion?: PropertyEntityQuestion;
  initialComments?: string;
}

interface IReviewFormalizedQuestionReply {
  replyType: "REVIEW_FORMALIZED_QUESTION";
  isInvalid?: boolean;
  formalizedQuestion?: PropertyEntityQuestion;
  reviewerComments?: string;
}

interface IDecomposeQuestionReply {
  replyType: "DECOMPOSE_QUESTION";
  isInvalid?: boolean;
  didPass?: boolean;
  a1?: PropertyEntityQuestion;
  a2?: PropertyEntityQuestion;
  aggregation?: Aggregation;
  initialComments?: string;
}

interface IReviewDecomposedQuestionReply {
  replyType: "REVIEW_DECOMPOSED_QUESTION";
  isInvalid?: boolean;
  didPass?: boolean;
  a1?: PropertyEntityQuestion;
  a2?: PropertyEntityQuestion;
  aggregation?: Aggregation;
  reviewerComments?: string;
}

// STATE

export type UserId = string;

type WorkspaceId = number;

interface IWorkspace {
  id: WorkspaceId;
  assignedTo: UserId | null;
  isActive: boolean;
  workspaceType: string;
}

export interface IGenerateQuestionsWorkspace extends IWorkspace {
  workspaceType: "GENERATE_QUESTIONS_WORKSPACE";
}

export interface IFormalizeQuestionWorkspace extends IWorkspace {
  workspaceType: "FORMALIZE_QUESTION_WORKSPACE";
  question: string;
  isInvalid?: boolean;
  formalizedQuestion?: PropertyEntityQuestion;
  initialComments?: string;
  reviewerComments?: string;
  isUnderReview: boolean;
}

export interface IDecompositionWorkspace extends IWorkspace {
  parentId?: WorkspaceId;
  workspaceType: "DECOMPOSITION_WORKSPACE";
  question: PropertyEntityQuestion;
  isInvalid?: boolean;
  didPass?: boolean;
  a1?: PropertyEntityQuestion;
  a2?: PropertyEntityQuestion;
  aggregation?: Aggregation;
  initialComments?: string;
  reviewerComments?: string;
  isUnderReview: boolean;
}

export type Workspace =
  | IGenerateQuestionsWorkspace
  | IFormalizeQuestionWorkspace
  | IDecompositionWorkspace;

export interface IState {
  reviewers: UserId[];
  idIndex: number;
  depthLimit: number;
  generateQuestionsWorkspaces: IGenerateQuestionsWorkspace[];
  formalizeQuestionWorkspaces: IFormalizeQuestionWorkspace[];
  decompositionWorkspaces: IDecompositionWorkspace[];
}

export type State = IState;

export interface IHistory {
  actions: Action[];
  initialState: IState;
}

export type History = IHistory;

// TEMPLATE

export type FormalQuestion = { property?: string; entity: string };

export type FormalizationReply =
  | { replyType: "FormalQuestion"; question: FormalQuestion; comments: string }
  | { replyType: "InvalidQuestion"; comments: string };

export type DecomposerReply =
  | {
      replyType: "Decomposition";
      subquestions: FormalQuestion[];
      aggregation: string;
      comments: string;
    }
  | { replyType: "Answer"; comments: string }
  | { replyType: "InvalidQuestion"; comments: string };

export type Template =
  | GeneratorTemplate
  | FormalizationTemplate
  | DecomposerTemplate;

export type GeneratorTemplate = {
  templateIdentifier: "generator_template";
  templateData: {
    prompt: string;
    questionsPerPrompt: number;
  };
};

export type FormalizationTemplate = {
  templateIdentifier: "formalization_template";
  templateData: {
    naturalQuestion: string;
    response?: FormalizationReply;
    propertyOptions: string[];
  };
};

export type DecomposerTemplate = {
  templateIdentifier: "decomposition_template";
  templateData: {
    question: FormalQuestion;
    depth: number;
    response?: DecomposerReply;
    propertyOptions: string[];
  };
};
