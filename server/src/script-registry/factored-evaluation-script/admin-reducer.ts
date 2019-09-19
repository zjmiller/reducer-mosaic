import produce from "immer";

import { FactoredEvaluationAction } from "./actions";
import { FactoredEvaluationScriptState } from "./index";

export const adminReducer = (
  state: FactoredEvaluationScriptState,
  action: FactoredEvaluationAction,
): FactoredEvaluationScriptState => {
  // We're using immer to immutably change state
  // by "mutating" draft state. We know actual state
  // isn't changing because of deepFreeze in rootReducer.
  const newState = produce(state, draftState => {
    const {
      judgeWorkspaces,
      honestWorkspaces,
      maliciousWorkspaces,
    } = draftState;

    const allWorkspaces = [
      ...judgeWorkspaces,
      ...honestWorkspaces,
      ...maliciousWorkspaces,
    ];

    if (action.actionType === "_ADMIN_UN_ASSIGN_ALL") {
      allWorkspaces.forEach(w => (w.assignedTo = null));
    }
  });

  return newState;
};
