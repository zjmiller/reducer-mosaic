import { IDecompositionWorkspace, IState } from "./types";

export function getAllWorkspaces(state: IState) {
  const {
    generateQuestionsWorkspaces,
    formalizeQuestionWorkspaces,
    decompositionWorkspaces,
  } = state;

  const allWorkspaces = [
    ...generateQuestionsWorkspaces,
    ...formalizeQuestionWorkspaces,
    ...decompositionWorkspaces,
  ];

  return allWorkspaces;
}

export function getDepthOfDecompositionWorkspace(
  state: IState,
  workspace: IDecompositionWorkspace,
) {
  let depth = 1;
  let curWorkspace = workspace;
  while (curWorkspace.parentId) {
    depth++;

    const parent = state.decompositionWorkspaces.find(
      w => w.id === curWorkspace.parentId,
    );

    if (!parent) {
      break;
    }

    curWorkspace = parent;
  }
  return depth;
}
