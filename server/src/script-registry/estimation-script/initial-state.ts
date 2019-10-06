import {
  IDecompositionWorkspace,
  IFormalizeQuestionWorkspace,
  IGenerateQuestionsWorkspace,
  IState,
  UserId,
} from "./types";

const initialGenerateQuestionsWorkspace = {
  id: 1,
  workspaceType: "GENERATE_QUESTIONS_WORKSPACE",
  assignedTo: null,
  isActive: true,
};

export function getInitialState() {
  const initialState: IState = {
    reviewers: [] as UserId[],
    idIndex: 2,
    depthLimit: 0,
    generateQuestionsWorkspaces: [
      initialGenerateQuestionsWorkspace,
    ] as IGenerateQuestionsWorkspace[],
    formalizeQuestionWorkspaces: [] as IFormalizeQuestionWorkspace[],
    decompositionWorkspaces: [] as IDecompositionWorkspace[],
  };

  return initialState;
}
