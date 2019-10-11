import { User } from '../../user';
import { IState } from './types';
import { getAllWorkspaces } from './utils';


function workspacePriority(workspace: any): number {
  switch (workspace.workspaceType) {
    case "DECOMPOSITION_WORKSPACE": return 0;
    case "FORMALIZE_QUESTION_WORKSPACE": return 1;
    case "GENERATE_QUESTIONS_WORKSPACE": return 2;
  }
  return 999;
}

export function getEligibleInteractionsForUser(state: IState, user: User) {
  let allWorkspaces = getAllWorkspaces(state);
  allWorkspaces = allWorkspaces.filter(w => w.isActive && w.assignedTo === null);
  allWorkspaces = allWorkspaces.sort((a, b) => (workspacePriority(a) - workspacePriority(b)));
  return allWorkspaces;
}

export function getAlreadyAssignedInteractionsForUser(
  state: IState,
  user: User,
) {
  const allWorkspaces = getAllWorkspaces(state);

  const alreadyAssignedWorkspace = allWorkspaces.find(
    w => w.assignedTo === user.id,
  );

  return alreadyAssignedWorkspace ? alreadyAssignedWorkspace : null;
}
