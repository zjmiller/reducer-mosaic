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

import { CopyablePrngId } from "../helpers/create-seeded-random-id-generator";

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
};

export type FactoredEvaluationScriptHistory = {
  initialState: FactoredEvaluationScriptState;
  actions: FactoredEvaluationAction[];
};

export class FactoredEvaluationScript implements IScript {
  public id: string;
  private state: FactoredEvaluationScriptState;
  private history: FactoredEvaluationScriptHistory;
  private prngId: CopyablePrngId; // pseudo-random uuid generator
  private randomSeedString: string; // used to make prngId above

  private rootLevelQuestion: string;

  private initialExperts: Experts;
  private scriptDAO: ScriptDAO;

  constructor({
    id,
    rootLevelQuestion,
    experts,
    history,
    randomSeedString,
    prngId,
    scriptDAO,
  }: {
    id: string;
    rootLevelQuestion: string;
    experts: Experts;
    history: FactoredEvaluationScriptHistory;
    randomSeedString: string;
    prngId: CopyablePrngId;
    scriptDAO: ScriptDAO;
  }) {
    this.id = id;
    this.rootLevelQuestion = rootLevelQuestion;
    this.initialExperts = experts;
    this.history = history;
    this.randomSeedString = randomSeedString;
    this.prngId = prngId;
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
      ? this.prngId.createFreshCopy()
      : this.prngId;

    let pastState: FactoredEvaluationScriptState = getInitialState();

    for (let j = 0; j < i; j++) {
      pastState = this.reducer(
        pastState,
        this.history.actions[j],
        localRngUUID,
      );
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
      experts: this.initialExperts,
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
      rootLevelQuestion: this.rootLevelQuestion,
      experts: this.initialExperts,
    };

    this.state = this.reducer(this.state, action, this.prngId);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.save();
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

    this.state = this.reducer(this.state, action, this.prngId);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.save();

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

    this.state = this.reducer(this.state, action, this.prngId);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.save();
  }

  public processAdminAction(action: any) {
    this.state = this.reducer(this.state, action, this.prngId);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.save();
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
