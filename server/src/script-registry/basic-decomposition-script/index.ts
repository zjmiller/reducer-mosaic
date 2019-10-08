const uuidv5 = require("uuid/v5");
const seedrandom = require("seedrandom");

import deepFreeze from "deep-freeze";

import { BasicDecompositionAction } from "./actions";
import { BasicDecompositionReply } from "./reply";
import { rootReducer } from "./root-reducer";
import { Workspace, WorkspaceTemplate } from "./workspace";

import { Interaction } from "../../interaction";
import { IScript } from "../../script";
import { WORKSPACE_TEMPLATE } from "../../template-identifiers";
import { User } from "../../user";

export type BasicDecompositionScriptState = {
  workspaces: Workspace[];
};

export type BasicDecompositionScriptHistory = {
  initialState: BasicDecompositionScriptState;
  actions: BasicDecompositionAction[];
};

export class BasicDecompositionScript implements IScript {
  private state: BasicDecompositionScriptState;
  private history: BasicDecompositionScriptHistory;
  private prngId: () => string; // pseudo-random uuid generator
  private randomSeedString: string; // used to make prngId above
  private defaultRootLevelQuestion =
    "This is the default content for a root-level question";
  private rootLevelQuestion: string;

  constructor({
    rootLevelQuestion,
    state,
    history,
    randomSeedString,
  }: {
    rootLevelQuestion?: string;
    state?: BasicDecompositionScriptState;
    history?: BasicDecompositionScriptHistory;
    randomSeedString?: string;
  } = {}) {
    this.randomSeedString = randomSeedString || String(Date.now());
    this.prngId = this.createSeededRandomIDGenerator(this.randomSeedString);

    this.rootLevelQuestion = rootLevelQuestion
      ? rootLevelQuestion
      : this.defaultRootLevelQuestion;

    this.history = history || {
      actions: [],
      initialState: this.generateInitialState(this.prngId),
    };

    this.state =
      state ||
      (history && this.getPastStateAtIndex(history.actions.length, false)) ||
      this.history.initialState;

    deepFreeze(this.state); // enforce immutability
  }

  public getEligibleInteractionsForUser(user: User) {
    return this.state.workspaces.filter(
      w => w.isActive === true && w.assignedTo === null,
    );
  }

  public getAlreadyAssignedInteractionForUser(user: User) {
    const interaction = this.state.workspaces.find(
      w => w.isActive === true && w.assignedTo === user.id,
    );

    return interaction ? interaction : null;
  }

  public getAllPendingInteractions() {
    return this.state.workspaces.filter(w => w.isActive);
  }

  public getHistory() {
    return this.history;
  }

  public getState() {
    return this.state;
  }

  public getPastStateAtIndex(i: number, shouldUseLocalRng = true) {
    if (i > this.history.actions.length) {
      i = this.history.actions.length;
    }

    // this creates a pseudo-random uuid generator with the same seed
    // as the one usually used
    const localRngUUID = shouldUseLocalRng
      ? this.createSeededRandomIDGenerator(this.randomSeedString)
      : this.prngId;

    let pastState: BasicDecompositionScriptState = this.generateInitialState(
      localRngUUID,
    );
    for (let j = 0; j < i; j++) {
      pastState = this.reducer(
        pastState,
        this.history.actions[j],
        localRngUUID,
      );
    }

    return pastState;
  }

  public createCopy(i?: number) {
    const copyHistory =
      i !== undefined
        ? { ...this.history, actions: this.history.actions.slice(0, i) }
        : this.history;

    const newScript = new BasicDecompositionScript({
      history: copyHistory,
      randomSeedString: this.randomSeedString,
    });

    return newScript;
  }

  public generateTemplate(workspace: Workspace): WorkspaceTemplate {
    return {
      templateIdentifier: WORKSPACE_TEMPLATE,
      templateData: {
        id: workspace.id,
        question: workspace.question,
        subQuestions: this.state.workspaces
          .filter(w => w.parentId === workspace.id)
          .map(subQuestion => ({
            question: subQuestion.question,
            answer: subQuestion.answer,
          })),
      },
    };
  }

  public assignUserToInteraction({
    interaction,
    user,
  }: {
    interaction: Interaction;
    user: User;
  }): Interaction {
    const workspace = this.state.workspaces.find(w => w.id === interaction.id);

    if (!workspace) {
      throw Error("Interaction doesn't correspond to a workspace");
    }

    const action = {
      actionType: "ASSIGN_USER" as "ASSIGN_USER", // crazy typecast so "REPLY" is "REPLY" type and not string type
      workspaceId: workspace.id,
      userId: user.id,
    };

    // record action in script history
    this.history.actions.push(action);
    this.state = this.reducer(this.state, action, this.prngId);

    const updatedWorkspace = this.state.workspaces.find(
      w => w.id === interaction.id,
    );

    if (!updatedWorkspace) {
      throw Error("Updated workspace doesn't exist");
    }

    return updatedWorkspace;
  }

  public processReply({
    interaction,
    reply,
  }: {
    interaction: Interaction;
    reply: BasicDecompositionReply;
  }) {
    const workspace = this.state.workspaces.find(w => w.id === interaction.id);

    if (!workspace) {
      throw Error("Interaction doesn't correspond to a workspace");
    }

    const action = {
      actionType: "REPLY" as "REPLY", // crazy typecast so "REPLY" is "REPLY" type and not string type
      workspaceId: workspace.id,
      reply,
    };

    // record action in script history
    this.history.actions.push(action);
    this.state = this.reducer(this.state, action, this.prngId);
  }

  private reducer(
    state: BasicDecompositionScriptState,
    action: BasicDecompositionAction,
    rngUUID: () => string,
  ): BasicDecompositionScriptState {
    const newState = rootReducer(state, action, rngUUID);
    deepFreeze(newState); // enforce immutability
    return newState;
  }

  public processAdminAction(action: any) {
    console.log("Processing admin action");
  }

  private createSeededRandomIDGenerator(seedString: string): any {
    const prng = seedrandom(seedString);
    return () => {
      const randomNum = prng();
      const randomId: any = uuidv5(
        String(randomNum),
        "1b671a64-40d5-491e-99b0-da01ff1f3341",
      );
      return randomId;
    };
  }

  private generateInitialState(prngId: () => string) {
    const rootWorkspaceId = prngId();

    const rootWorkspace = {
      id: rootWorkspaceId,
      parentId: null,
      question: this.rootLevelQuestion || "Root level",
      isActive: true,
      answer: null,
      subQuestions: [],
      assignedTo: null,
    };

    return { workspaces: [rootWorkspace] };
  }
}
