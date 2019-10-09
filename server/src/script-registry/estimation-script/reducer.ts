import deepFreeze from "deep-freeze";
import { produce } from "immer";

import { Action, State } from "./types";
import { getAllWorkspaces, getDepthOfDecompositionWorkspace } from "./utils";

export function rootReducer(state: State, action: Action) {
  deepFreeze(state);

  const newState = produce(state, draftState => {
    if (action.actionType === "SETUP") {
      const { setupData } = action;
      const formalizeQuestionWorkspaces = setupData.initialQuestions.map(q => ({
        id: draftState.idIndex++,
        workspaceType: "FORMALIZE_QUESTION_WORKSPACE" as "FORMALIZE_QUESTION_WORKSPACE",
        question: q,
        assignedTo: null,
        isActive: true,
        isUnderReview: false,
      }));

      draftState.formalizeQuestionWorkspaces.push(
        ...formalizeQuestionWorkspaces,
      );

      draftState.depthLimit = setupData.depthLimit;

      draftState.reviewers = setupData.reviewers;
    } else if (action.actionType === "ASSIGN_USER") {
      const allWorkspaces = getAllWorkspaces(draftState);

      const workspace = allWorkspaces.find(w => w.id === action.workspaceId);
      if (!workspace) {
        throw Error("Workspace not found.");
      }

      workspace.assignedTo = action.userId;

      // Make sure there's always an available generate questions workspace
      if (workspace.workspaceType === "GENERATE_QUESTIONS_WORKSPACE") {
        draftState.generateQuestionsWorkspaces.push({
          id: draftState.idIndex++,
          workspaceType: "GENERATE_QUESTIONS_WORKSPACE",
          assignedTo: null,
          isActive: true,
        });
      }
    } else if (action.actionType === "REPLY") {
      const { reply, workspaceId } = action;

      if (reply.replyType === "GENERATE_QUESTIONS") {
        const formalizeQuestionWorkspaces = reply.questions.map(q => ({
          id: draftState.idIndex++,
          workspaceType: "FORMALIZE_QUESTION_WORKSPACE" as "FORMALIZE_QUESTION_WORKSPACE",
          question: q,
          assignedTo: null,
          isActive: true,
          isUnderReview: false,
        }));

        draftState.formalizeQuestionWorkspaces.push(
          ...formalizeQuestionWorkspaces,
        );

        // Remove generate questions workspace now that it's served its purpose.
        draftState.generateQuestionsWorkspaces = draftState.generateQuestionsWorkspaces.filter(
          w => w.id !== workspaceId,
        );
      } else if (reply.replyType === "FORMALIZE_QUESTION") {
        const formalizedQuestionWorkspace = draftState.formalizeQuestionWorkspaces.find(
          w => w.id === workspaceId,
        );

        if (!formalizedQuestionWorkspace) {
          throw Error("Formalized question workspace not found.");
        }

        formalizedQuestionWorkspace.initialComments = reply.initialComments;

        if (reply.isInvalid === true) {
          formalizedQuestionWorkspace.isInvalid = true;
        } else if (reply.formalizedQuestion) {
          formalizedQuestionWorkspace.formalizedQuestion =
            reply.formalizedQuestion;
        }

        formalizedQuestionWorkspace.assignedTo = null;
        formalizedQuestionWorkspace.isUnderReview = true;
      } else if (reply.replyType === "REVIEW_FORMALIZED_QUESTION") {
        const formalizedQuestionWorkspace = draftState.formalizeQuestionWorkspaces.find(
          w => w.id === workspaceId,
        );

        if (!formalizedQuestionWorkspace) {
          throw Error("Formalized question workspace not found.");
        }

        formalizedQuestionWorkspace.reviewerComments = reply.reviewerComments;

        if (reply.isInvalid === true) {
          formalizedQuestionWorkspace.isInvalid = true;
        } else {
          if (reply.formalizedQuestion) {
            formalizedQuestionWorkspace.formalizedQuestion =
              reply.formalizedQuestion;
          }

          if (formalizedQuestionWorkspace.formalizedQuestion) {
            const decompositionWorkspace = {
              id: draftState.idIndex++,
              workspaceType: "DECOMPOSITION_WORKSPACE" as "DECOMPOSITION_WORKSPACE",
              question: formalizedQuestionWorkspace.formalizedQuestion,
              assignedTo: null,
              isActive: true,
              isUnderReview: false,
            };

            draftState.decompositionWorkspaces.push(decompositionWorkspace);
          }
        }

        formalizedQuestionWorkspace.assignedTo = null;
        formalizedQuestionWorkspace.isActive = false;
      } else if (reply.replyType === "DECOMPOSE_QUESTION") {
        const decomposeQuestionWorkspace = draftState.decompositionWorkspaces.find(
          w => w.id === workspaceId,
        );

        if (!decomposeQuestionWorkspace) {
          throw Error("Decompose question workspace not found.");
        }

        decomposeQuestionWorkspace.initialComments = reply.initialComments;

        if (reply.isInvalid === true) {
          decomposeQuestionWorkspace.isInvalid = true;
        } else if (reply.didPass === true) {
          decomposeQuestionWorkspace.didPass = true;
        } else {
          decomposeQuestionWorkspace.subquestions = reply.subquestions;
          decomposeQuestionWorkspace.aggregation = reply.aggregation;
        }

        decomposeQuestionWorkspace.assignedTo = null;
        decomposeQuestionWorkspace.isUnderReview = true;
      } else if (reply.replyType === "REVIEW_DECOMPOSED_QUESTION") {
        const decomposeQuestionWorkspace = draftState.decompositionWorkspaces.find(
          w => w.id === workspaceId,
        );

        if (!decomposeQuestionWorkspace) {
          throw Error("Decompose question workspace not found.");
        }

        decomposeQuestionWorkspace.reviewerComments = reply.reviewerComments;

        if (reply.isInvalid === true) {
          decomposeQuestionWorkspace.isInvalid = true;
        } else if (reply.didPass === true) {
          decomposeQuestionWorkspace.didPass = true;
        } else {
          if (reply.subquestions) {
            decomposeQuestionWorkspace.subquestions = reply.subquestions;
          }

          if (reply.aggregation) {
            decomposeQuestionWorkspace.aggregation = reply.aggregation;
          }

          if (decomposeQuestionWorkspace.subquestions) {
            // check depth limit
            const depth = getDepthOfDecompositionWorkspace(
              draftState,
              decomposeQuestionWorkspace,
            );

            if (depth >= draftState.depthLimit) {
              return;
            }

            for (const subquestion of decomposeQuestionWorkspace.subquestions) {
              const subquestionWorkspace = {
                id: draftState.idIndex++,
                parentId: decomposeQuestionWorkspace.id,
                workspaceType: "DECOMPOSITION_WORKSPACE" as "DECOMPOSITION_WORKSPACE",
                question: subquestion,
                assignedTo: null,
                isActive: true,
                isUnderReview: false,
              };

              draftState.decompositionWorkspaces.push(subquestionWorkspace);
            }
          }
        }

        decomposeQuestionWorkspace.assignedTo = null;
        decomposeQuestionWorkspace.isActive = false;
      }
    }
  });

  return newState;
}
