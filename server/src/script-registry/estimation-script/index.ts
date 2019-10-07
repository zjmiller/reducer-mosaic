import deepFreeze from "deep-freeze";

import { generateTemplate } from "./template";
import { getInitialState } from "./initial-state";
import { rootReducer } from "./reducer";
import { convertReplyIntoAction } from "./reply";
import {
  getAlreadyAssignedInteractionsForUser,
  getEligibleInteractionsForUser,
} from "./scheduling";
import { ScriptDAO } from "./repository";
import { getAllWorkspaces } from "./utils";

import {
  Action,
  History,
  InitialSetupData,
  Reply,
  State,
  Template,
  Workspace,
} from "./types";

import { Interaction } from "../../interaction";
import { IScript } from "../../script";
import { User } from "../../user";
import { ScriptRepository } from "./repository";

export class Script implements IScript {
  public id: string;
  private state: State;
  private history: History;
  private initialSetupData: InitialSetupData;
  private randomSeedString: string; // used to make ensure deterministic id generation in reducer
  private scriptDAO: ScriptDAO;

  constructor({
    id,
    initialSetupData,
    history,
    randomSeedString,
    scriptDAO,
  }: {
    id: string;
    initialSetupData: InitialSetupData;
    history: History;
    randomSeedString: string;
    scriptDAO: ScriptDAO;
  }) {
    this.id = id;
    this.randomSeedString = randomSeedString;
    this.initialSetupData = initialSetupData;
    this.history = history;
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
    return getEligibleInteractionsForUser(this.state, user);
  }

  public getAlreadyAssignedInteractionForUser(user: User) {
    return getAlreadyAssignedInteractionsForUser(this.state, user);
  }

  public getAllInteractions() {
    return getAllWorkspaces(this.state);
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

    let pastState: State = getInitialState();

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

    const newScript = await ScriptRepository.create({
      history: copyHistory,
      initialSetupData: this.initialSetupData,
      randomSeedString: this.randomSeedString,
    });

    return newScript;
  }

  public generateTemplate(workspace: Workspace): Template {
    return generateTemplate(this.state, workspace);
  }

  private setupRun(): void {
    const action = {
      actionType: "SETUP" as "SETUP",
      initialSetupData: this.initialSetupData,
    };

    this.state = this.reducer(this.state, action);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.saveActionToDb();
  }

  public assignUserToInteraction({
    interaction,
    user,
  }: {
    interaction: Interaction;
    user: User;
  }): Interaction {
    const workspace = getAllWorkspaces(this.state).find(
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

    this.state = this.reducer(this.state, action);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.saveActionToDb();

    const updatedWorkspace = getAllWorkspaces(this.state).find(
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
    reply: Reply;
  }) {
    const workspace = getAllWorkspaces(this.state).find(
      w => w.id === interaction.id,
    );

    if (!workspace) {
      throw Error("Interaction doesn't correspond to a workspace");
    }

    const action = convertReplyIntoAction(reply, workspace);

    this.state = this.reducer(this.state, action);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.saveActionToDb();
  }

  public processAdminAction(action: any) {
    this.state = this.reducer(this.state, action);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.saveActionToDb();
  }

  private reducer(state: State, action: Action): State {
    const newState = rootReducer(state, action);

    deepFreeze(newState); // enforce immutability
    return newState;
  }
}
