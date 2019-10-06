import { State, Template, Workspace } from "./types";

export function generateTemplate(state: State, workspace: Workspace): Template {
  if (workspace.workspaceType === "GENERATE_QUESTIONS_WORKSPACE") {
    return {
      templateIdentifier: "generator_template",
      templateData: {
        prompt: "Generate some questions",
        questionsPerPrompt: 3,
      },
    };
  } else if (workspace.workspaceType === "FORMALIZE_QUESTION_WORKSPACE") {
  } else if (workspace.workspaceType === "DECOMPOSITION_WORKSPACE") {
  }

  throw Error("Workspace doesn't have a corresponding template");
}
