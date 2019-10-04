import produce from "immer";
import { Action } from "./actions";
import { Reply, Template } from "./templateInterface";
import { Parameters } from "./types";
import { Workspace, WorkspaceId } from "./workspace";

// I want a function "pendingWorkForDecomposition" that maps the decomposition to new workspaces for that decomposition
// If a workpace has already been created, don't create it twice though.
// Store that an interaction is pending within a decomposition?
// Tree defined by ids vs. tree defined by object composition
// If I want "pointers" to parts of the tree and to be able to access a parent from these
// pointers, I need to store a parent pointer within the object - but do I ever need this?

// F*CK it, give everything ID's, make it at least correspond to workspaces

export interface Question {
  promptID?: string
  id: string
  text: string
  source: string
}

export type State = {
  workspaces: Workspace[];
  parameters: Parameters;
  nextWorkspaceId: number;
};

function newId(draftState: State): WorkspaceId {
  const id = draftState.nextWorkspaceId.toString();
  draftState.nextWorkspaceId += 1;
  return id;
}


export const rootReducer = (
  state: State,
  action: Action,
  prngId: () => string,
): State => {
  return produce(state, draftState => {
    const workspaces = draftState.workspaces;
    if (action.actionType === "SETUP_RUN") {
      draftState.parameters = action.parameters;
      draftState.nextWorkspaceId = 1;
      draftState.workspaces = Array<Workspace>();
      const data = {
        prompt: draftState.parameters.prompt,
      };
      draftState.workspaces.push(
        {
          id: newId(draftState),
          children: [],
          workspaceType: "Generator",
          data,
          interactions: [{
            template: {
              templateIdentifier: "generator_template",
              templateData: {
                ...data,
                questionsPerPrompt: draftState.parameters.questionsPerPrompt
              }
            }
          }]
        });
    } else {
      const workspace = workspaces.find(w => w.id === action.workspaceId);
      if (!workspace) {
        throw Error("Workspace not found");
      }
      if (action.actionType === "REPLY") {
        if (workspace.interactions.length === 0) {
          throw Error("No interactions on workspace")
        }
        const interaction = workspace.interactions[-1];
        if (interaction.reply !== undefined) {
          throw Error("Interaction already finished!")
        }
        const reply: Reply = action.reply;
        interaction.reply = reply;
        if (reply.replyType === "InitialQuestions") {
          workspaces.concat(
            reply.questions.map(text => {
              const data = {
                naturalQuestion: text,
              };
              const id = newId(draftState);
              workspace.children.push(id);
              return {
                id,
                children: [],
                workspaceType: "Formalization",
                parentId: workspace.id,
                data,
                interactions: [{
                  template: {
                    templateIdentifier: "formalization_template",
                    templateData: {
                      ...data,
                      propertyOptions: draftState.parameters.propertyOptions,
                    }
                  } as Template
                }],
              } as Workspace;
            });
        } else if (reply.replyType === "FormalQuestion") {
          const id = newId(draftState);
          const data = {
            question: reply.question,
            depth: draftState.parameters.maxDepth,
          };
          workspace.children.push(id);
          workspaces.push({
            id,
            children: [],
            parentId: workspace.id,
            workspaceType: "Decomposition",
            data,
            interactions: [{
              template: {
                templateIdentifier: "decomposition_template",
                templateData: {
                  ...data,
                  propertyOptions: draftState.parameters.propertyOptions,
                }
              } as Template
            }],
          } as Workspace);
          // } else if (reply.replyType === "Decomposition") {
          //   const id = newId(draftState);
          //   const data = {
          //     question: reply.question,
          //     depth: workspace.data.depth - 1,
          //   };
          //   workspaces.push({
          //     id,
          //     children: [],
          //     workspaceType: "Decomposition",
          //     data,
          //     interactions: [{
          //       template: {
          //         templateIdentifier: "decomposition_template",
          //         templateData: {
          //           ...data,
          //           propertyOptions: draftState.parameters.propertyOptions,
          //         }
          //       } as Template
          //     }],
          //   } as Workspace);

        } else {
          throw Error("Unrecognized reply type");
        }
      } else if (action.actionType === "ASSIGN_USER") {
        if (workspace.interactions.length === 0) {
          throw Error("No interactions on workspace")
        }
        const interaction = workspace.interactions[-1];
        if (interaction.reply !== undefined) {
          throw Error("Interaction already finished!")
        }
        if (interaction.userId !== undefined) {
          throw Error("Interaction already finished!")
        }
        interaction.userId = action.userId;
      }
    }
  });
};
