import { IState } from "./types";
import { getAllWorkspaces } from "./utils";

import { User } from "../../user";

export function getEligibleInteractionsForUser(state: IState, user: User) {
  const allWorkspaces = getAllWorkspaces(state);

  return allWorkspaces.filter(w => w.isActive && w.assignedTo === null);
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
