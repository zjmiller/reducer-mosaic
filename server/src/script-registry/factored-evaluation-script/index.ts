import deepFreeze from "deep-freeze";

import { FactoredEvaluationAction } from "./actions";
import { getInitialState } from "./get-initial-state";
import {
  FactoredEvaluationWorkspaceTemplate,
  generateTemplate,
} from "./generate-template";
import { FactoredEvaluationReply } from "./reply";
import { rootReducer } from "./root-reducer";
import {
  FactoredEvaluationScriptRepository,
  ScriptDAO,
} from "./script-repository";
import {
  JudgeWorkspace,
  HonestWorkspace,
  MaliciousWorkspace,
  FactoredEvaluationWorkspace,
} from "./workspace";

import { ExportWithContent } from "../../content/export";
import { Interaction } from "../../interaction";
import { IScript } from "../../script";
import { User } from "../../user";

export type Experts = {
  honest: string[];
  malicious: string[];
};

export type FactoredEvaluationScriptState = {
  judgeWorkspaces: JudgeWorkspace[];
  honestWorkspaces: HonestWorkspace[];
  maliciousWorkspaces: MaliciousWorkspace[];
  experts: Experts;
  availableExports: ExportWithContent[];
  ids: string[];
  randomSeedString: string;
};

export type FactoredEvaluationScriptHistory = {
  initialState: FactoredEvaluationScriptState;
  actions: FactoredEvaluationAction[];
};

export type SetupData = {
  rootLevelQuestion: string;
  initialExperts: Experts;
};

export class FactoredEvaluationScript implements IScript {
  public id: string;
  private state: FactoredEvaluationScriptState;
  private history: FactoredEvaluationScriptHistory;
  private randomSeedString: string; // used to make ensure deterministic id generation in reducer

  private setupData: SetupData;
  private scriptDAO: ScriptDAO;

  constructor({
    id,
    setupData,
    history,
    randomSeedString,
    scriptDAO,
  }: {
    id: string;
    setupData: SetupData;
    history: FactoredEvaluationScriptHistory;
    randomSeedString: string;
    scriptDAO: ScriptDAO;
  }) {
    this.id = id;
    this.setupData;
    this.history = history;
    this.randomSeedString = randomSeedString;
    this.scriptDAO = scriptDAO;

    this.state =
      history && this.getPastStateAtIndex(history.actions.length, false);

    deepFreeze(this.state); // enforce immutability

    // If this run is starting from a blank slate, dispatch setup action
    if (history.actions.length === 0) {
      this.setupRun();
    }
  }

  public getEligibleInteractionsForUser(user: User) {
    const isHonestExpert = this.state.experts.honest.some(
      email => email === user.email,
    );
    if (isHonestExpert) {
      const eligibleHonestWorkspaces = this.state.honestWorkspaces.filter(
        w => w.isActive === true && w.assignedTo === null,
      );

      return eligibleHonestWorkspaces;
    }

    const isMaliciousExpert = this.state.experts.malicious.some(
      email => email === user.email,
    );
    if (isMaliciousExpert) {
      const eligibleMaliciousWorkspaces = this.state.maliciousWorkspaces.filter(
        w => w.isActive === true && w.assignedTo === null,
      );

      return eligibleMaliciousWorkspaces;
    }

    const eligibleJudgeWorkspaces = this.state.judgeWorkspaces.filter(
      w => w.isActive === true && w.assignedTo === null,
    );

    return eligibleJudgeWorkspaces;
  }

  public getAlreadyAssignedInteractionForUser(user: User) {
    const interaction = this.getAllWorkspaces().find(
      w => w.isActive === true && w.assignedTo === user.id,
    );

    return interaction ? interaction : null;
  }

  public getAllPendingInteractions() {
    return this.getAllWorkspaces().filter(w => w.isActive);
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

    let pastState: FactoredEvaluationScriptState = getInitialState();

    for (let j = 0; j < i; j++) {
      pastState = this.reducer(pastState, this.history.actions[j]);
    }

    return pastState;
  }

  public async createCopy(i?: number) {
    const copyHistory =
      i !== undefined
        ? { ...this.history, actions: this.history.actions.slice(0, i) }
        : this.history;

    const newScript = await FactoredEvaluationScriptRepository.create({
      history: copyHistory,
      randomSeedString: this.randomSeedString,
      setupData: this.setupData,
    });

    return newScript;
  }

  public generateTemplate(
    workspace: FactoredEvaluationWorkspace,
  ): FactoredEvaluationWorkspaceTemplate {
    return generateTemplate(workspace, this.state);
  }

  private setupRun(): void {
    const action = {
      actionType: "SETUP_RUN" as "SETUP_RUN",
      setupData: { ...this.setupData, randomSeedString: this.randomSeedString },
    };

    this.dispatchAction(action);
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

    this.dispatchAction(action);

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

    this.dispatchAction(action);
  }

  public processAdminAction(action: any) {
    this.dispatchAction(action);
  }

  private reducer(
    state: FactoredEvaluationScriptState,
    action: FactoredEvaluationAction,
  ): FactoredEvaluationScriptState {
    const newState = rootReducer(state, action);

    deepFreeze(newState); // enforce immutability
    return newState;
  }

  private dispatchAction(action: FactoredEvaluationAction) {
    this.state = this.reducer(this.state, action);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.saveActionToDb(action, this.history.actions.length - 1);
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
