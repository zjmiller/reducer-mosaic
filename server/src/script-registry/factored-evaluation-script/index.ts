import deepFreeze from "deep-freeze";

import { FactoredEvaluationAction } from "./actions";
import { generateInitialState } from "./generate-initial-state";
import {
  FactoredEvaluationWorkspaceTemplate,
  generateTemplate,
} from "./generate-template";
import { FactoredEvaluationReply } from "./reply";
import { rootReducer } from "./root-reducer";
import {
  JudgeWorkspace,
  HonestWorkspace,
  MaliciousWorkspace,
  FactoredEvaluationWorkspace,
} from "./workspace";

import { createSeededRandomIdGenerator } from "../helpers/create-seeded-random-id-generator";

import { ExportWithContent } from "../../content/export";
import { Interaction } from "../../interaction";
import { IScript } from "../../script";
import { User } from "../../user";

export type ExpertAssignments = {
  honest: string[];
  malicious: string[];
};

export type FactoredEvaluationScriptState = {
  judgeWorkspaces: JudgeWorkspace[];
  honestWorkspaces: HonestWorkspace[];
  maliciousWorkspaces: MaliciousWorkspace[];
  experts: ExpertAssignments;
  availableExports: ExportWithContent[];
};

export type FactoredEvaluationScriptHistory = {
  initialState: FactoredEvaluationScriptState;
  actions: FactoredEvaluationAction[];
};

export class FactoredEvaluationScript implements IScript {
  private state: FactoredEvaluationScriptState;
  private history: FactoredEvaluationScriptHistory;
  private prngId: () => string; // pseudo-random uuid generator
  private randomSeedString: string; // used to make prngId above

  private defaultRootLevelQuestion =
    "This is the default content for a factored evaluation root-level question";
  private rootLevelQuestion: string;

  private defaultInitialExperts = {
    honest: [],
    malicious: [],
  };
  private initialExperts: ExpertAssignments;

  constructor({
    rootLevelQuestion,
    experts,
    state,
    history,
    randomSeedString,
  }: {
    rootLevelQuestion?: string;
    experts?: ExpertAssignments;
    state?: FactoredEvaluationScriptState;
    history?: FactoredEvaluationScriptHistory;
    randomSeedString?: string;
  } = {}) {
    this.randomSeedString = randomSeedString || String(Date.now());
    this.prngId = createSeededRandomIdGenerator(this.randomSeedString);

    this.rootLevelQuestion = rootLevelQuestion
      ? rootLevelQuestion
      : this.defaultRootLevelQuestion;

    this.initialExperts = experts ? experts : this.defaultInitialExperts;

    this.history = history || {
      actions: [],
      initialState: generateInitialState({
        initialExperts: this.initialExperts,
        prngId: this.prngId,
        rootLevelQuestion: this.rootLevelQuestion,
      }),
    };

    this.state =
      state ||
      (history && this.getPastStateAtIndex(history.actions.length, false)) ||
      this.history.initialState;

    deepFreeze(this.state); // enforce immutability
  }

  public getEligibleInteractionsForUser(user: User) {
    let eligibleInteractionsForUser = [] as FactoredEvaluationWorkspace[];

    const isHonestExpert = this.state.experts.honest.some(id => id === user.id);
    if (isHonestExpert) {
      const eligibleHonestWorkspaces = this.state.honestWorkspaces.filter(
        w => w.isActive === true && w.assignedTo === null,
      );

      eligibleInteractionsForUser = eligibleInteractionsForUser.concat(
        eligibleHonestWorkspaces,
      );
    }

    const isMaliciousExpert = this.state.experts.malicious.some(
      id => id === user.id,
    );
    if (isMaliciousExpert) {
      const eligibleMaliciousWorkspaces = this.state.maliciousWorkspaces.filter(
        w => w.isActive === true && w.assignedTo === null,
      );

      eligibleInteractionsForUser = eligibleInteractionsForUser.concat(
        eligibleMaliciousWorkspaces,
      );
    }

    const eligibleJudgeWorkspaces = this.state.judgeWorkspaces.filter(
      w => w.isActive === true && w.assignedTo === null,
    );

    eligibleInteractionsForUser = eligibleInteractionsForUser.concat(
      eligibleJudgeWorkspaces,
    );

    return eligibleInteractionsForUser;
  }

  public getAlreadyAssignedInteractionForUser(user: User) {
    const interaction = this.getAllInteractions().find(
      w => w.isActive === true && w.assignedTo === user.id,
    );

    return interaction ? interaction : null;
  }

  public getAllInteractions() {
    return this.getAllWorkspaces();
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
      ? createSeededRandomIdGenerator(this.randomSeedString)
      : this.prngId;

    let pastState: FactoredEvaluationScriptState = generateInitialState({
      initialExperts: this.initialExperts,
      prngId: localRngUUID,
      rootLevelQuestion: this.rootLevelQuestion,
    });

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

    const newScript = new FactoredEvaluationScript({
      history: copyHistory,
      randomSeedString: this.randomSeedString,
      experts: this.initialExperts,
    });

    return newScript;
  }

  public generateTemplate(
    workspace: FactoredEvaluationWorkspace,
  ): FactoredEvaluationWorkspaceTemplate {
    return generateTemplate(workspace, this.state);
  }

  public assignUserToInteraction({
    interaction,
    user,
  }: {
    interaction: Interaction;
    user: User;
  }): Interaction {
    const workspace = this.getAllWorkspaces().find(
      w => w.id === interaction.id,
    );

    if (!workspace) {
      throw Error("Interaction doesn't correspond to a workspace");
    }

    const action = {
      actionType: "ASSIGN_USER" as "ASSIGN_USER",
      workspaceId: workspace.id,
      userId: user.id,
    };

    // record action in script history
    this.history.actions.push(action);
    this.state = this.reducer(this.state, action, this.prngId);

    const updatedWorkspace = this.getAllWorkspaces().find(
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
    reply: FactoredEvaluationReply;
  }) {
    const workspace = this.getAllWorkspaces().find(
      w => w.id === interaction.id,
    );

    if (!workspace) {
      throw Error("Interaction doesn't correspond to a workspace");
    }

    const action = {
      actionType: "REPLY" as "REPLY",
      workspaceId: workspace.id,
      reply,
    };

    // record action in script history
    this.history.actions.push(action);
    this.state = this.reducer(this.state, action, this.prngId);
  }

  public processAdminAction(action: any) {
    // record action in script history
    this.history.actions.push(action);
    this.state = this.reducer(this.state, action, this.prngId);
  }

  private reducer(
    state: FactoredEvaluationScriptState,
    action: FactoredEvaluationAction,
    rngUUID: () => string,
  ): FactoredEvaluationScriptState {
    const newState = rootReducer(state, action, rngUUID);
    deepFreeze(newState); // enforce immutability
    return newState;
  }

  private getAllWorkspaces() {
    const {
      judgeWorkspaces,
      honestWorkspaces,
      maliciousWorkspaces,
    } = this.state;

    const allWorkspaces = [
      ...judgeWorkspaces,
      ...honestWorkspaces,
      ...maliciousWorkspaces,
    ];

    return allWorkspaces;
  }
}
