import { createSeededRandomIdGenerator } from "../helpers/create-seeded-random-id-generator";
import produce from "immer";

import { FactoredEvaluationAction } from "./actions";
import { FactoredEvaluationScriptState } from "./index";

export const setupReducer = (
  state: FactoredEvaluationScriptState,
  action: FactoredEvaluationAction,
): FactoredEvaluationScriptState => {
  // We're using immer to immutably change state
  // by "mutating" draft state. We know actual state
  // isn't changing because of deepFreeze in rootReducer.
  const newState = produce(state, draftState => {
    if (action.actionType === "SETUP_RUN") {
      draftState.randomSeedString = action.randomSeedString;
      const prngId = createSeededRandomIdGenerator(action.randomSeedString);
      const id = prngId();
      draftState.ids.push(id);

      const rootWorkspace = {
        id,
        isActive: true,
        assignedTo: null,
        containsExports: [],

        workspaceType: "HONEST" as "HONEST",
        judgeParentId: null,
        question: [
          {
            contentType: "TEXT" as "TEXT",
            text: action.rootLevelQuestion || "Root level",
          },
        ],
        answerCandidate: null,
      };

      draftState.honestWorkspaces.push(rootWorkspace);
      draftState.experts = action.experts;
    }
  });

  return newState;
};
