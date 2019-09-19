import produce from "immer";

import { BasicDecompositionAction } from "./actions";
import { Workspace } from "./workspace";

export type BasicDecompositionScriptState = {
  workspaces: Workspace[];
};

export const rootReducer = (
  state: BasicDecompositionScriptState,
  action: BasicDecompositionAction,
  prngId: () => string,
): BasicDecompositionScriptState => {
  return produce(state, draftState => {
    const workspaces = draftState.workspaces;
    const workspace = workspaces.find(w => w.id === action.workspaceId);

    if (!workspace) {
      throw Error("Workspace not found");
    }

    if (action.actionType === "REPLY") {
      const reply = action.reply;

      if (reply.replyType === "ASK_QUESTION") {
        const childWorkspace = {
          id: prngId(),
          parentId: workspace.id,
          isActive: true,
          assignedTo: null,
          question: reply.subQuestion,
          answer: null,
          subQuestions: [],
        };

        workspaces.push(childWorkspace);

        workspace.assignedTo = null;
        workspace.isActive = false;
      } else if (reply.replyType === "SUBMIT_ANSWER") {
        workspace.answer = reply.answer;
        workspace.assignedTo = null;
        workspace.isActive = false;

        const parent = workspaces.find(w => w.id === workspace.parentId);

        if (parent) {
          parent.isActive = true;
        }
      } else {
        throw Error("Unrecognized reply type");
      }
    } else if (action.actionType === "ASSIGN_USER") {
      workspace.assignedTo = action.userId;
    }
  });
};
