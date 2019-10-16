import { properties, State, Template, Workspace } from "./types";
import { getDepthOfDecompositionWorkspace } from "./utils";

export function generateTemplateFromWorkspace(
  state: State,
  workspace: Workspace,
): Template {
  if (workspace.workspaceType === "GENERATE_QUESTIONS_WORKSPACE") {
    return {
      templateIdentifier: "generator_template",
      templateData: {
        prompt: "Generate some questions",
        questionsPerPrompt: 1,
      },
    };
  } else if (workspace.workspaceType === "FORMALIZE_QUESTION_WORKSPACE") {
    if (
      workspace.isUnderReview === true &&
      workspace.initialComments !== void 0
    ) {
      if (!workspace.isInvalid && workspace.formalizedQuestion !== void 0) {
        return {
          templateIdentifier: "formalization_template",
          templateData: {
            naturalQuestion: workspace.question,
            response: {
              replyType: "FormalQuestion",
              question: {
                property: workspace.formalizedQuestion.property,
                entity: workspace.formalizedQuestion.entity,
              },
              comments: workspace.initialComments,
            },
            propertyOptions: properties,
          },
        };
      } else if (workspace.isInvalid === true) {
        return {
          templateIdentifier: "formalization_template",
          templateData: {
            naturalQuestion: workspace.question,
            response: {
              replyType: "InvalidQuestion",
              comments: workspace.initialComments,
            },
            propertyOptions: properties,
          },
        };
      }
    } else if (!workspace.isUnderReview) {
      return {
        templateIdentifier: "formalization_template",
        templateData: {
          naturalQuestion: workspace.question,
          propertyOptions: properties,
        },
      };
    }
  } else if (workspace.workspaceType === "DECOMPOSITION_WORKSPACE") {
    if (!workspace.isUnderReview) {
      return {
        templateIdentifier: "decomposition_template",
        templateData: {
          question: workspace.question,
          depth:
            state.depthLimit -
            getDepthOfDecompositionWorkspace(state, workspace),
          propertyOptions: properties,
        },
      };
    } else if (
      workspace.subquestions !== void 0 &&
      workspace.aggregation !== void 0 &&
      workspace.initialComments !== void 0
    ) {
      return {
        templateIdentifier: "decomposition_template",
        templateData: {
          question: workspace.question,
          depth:
            state.depthLimit -
            getDepthOfDecompositionWorkspace(state, workspace),
          propertyOptions: properties,
          response: {
            replyType: "Decomposition",
            subquestions: workspace.subquestions,
            aggregation: workspace.aggregation,
            comments: workspace.initialComments,
          },
        },
      };
    }
  }

  throw Error("Workspace doesn't have a corresponding template");
}
