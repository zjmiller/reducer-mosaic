import deepFreeze from "deep-freeze";

import { generateTemplateFromWorkspace } from "./template";
import { getInitialState } from "./initial-state";
import { rootReducer } from "./reducer";
import { convertReplyIntoAction } from "./reply";
import { getEligibleWorkspacesForUser } from "./scheduling";
import { ScriptDAO } from "./repository";
import { getAllWorkspaces } from "./utils";

import {
  Action,
  History,
  SetupData,
  Reply,
  State,
  Template,
  Workspace,
} from "./types";

import { Interaction } from "../../interaction/interaction";
import { IScript } from "../../script/script";
import { User } from "../../user/user";
import { ScriptRepository } from "./repository";

export class Script implements IScript {
  public id: string;
  private state: State;
  private history: History;
  private setupData: SetupData;
  private randomSeedString: string; // used to make ensure deterministic id generation in reducer
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
    history: History;
    randomSeedString: string;
    scriptDAO: ScriptDAO;
  }) {
    this.id = id;
    this.randomSeedString = randomSeedString;
    this.setupData = setupData;
    this.history = history;
    this.scriptDAO = scriptDAO;

    this.state = history && this.getPastStateAtIndex(history.actions.length);

    deepFreeze(this.state); // enforce immutability

    // If this run is starting from a blank slate, dispatch the setup action.
    if (history.actions.length === 0) {
      this.setupRun();
    }
  }

  public getEligibleWorkspacesForUser(user: User) {
    return getEligibleWorkspacesForUser(this.state, user);
  }

  public getHistory() {
    return this.history;
  }

  public getState() {
    return this.state;
  }

  public getPastStateAtIndex(i: number) {
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
      setupData: this.setupData,
      randomSeedString: this.randomSeedString,
    });

    return newScript;
  }

  public generateTemplate(interaction: Interaction): Template {
    const assignAction = this.history.actions[
      interaction.internalScriptReference
    ];

    if (!assignAction || assignAction.actionType !== "ASSIGN_USER") {
      throw Error("");
    }

    const workspace = getAllWorkspaces(this.state).find(
      w => w.id === assignAction.workspaceId,
    );

    if (!workspace) {
      throw Error("");
    }

    return generateTemplateFromWorkspace(this.state, workspace);
  }

  private setupRun(): void {
    const action = {
      actionType: "SETUP" as "SETUP",
      setupData: this.setupData,
    };

    this.dispatchAction(action);
  }

  public assignUserToWorkspace({
    workspace,
    user,
  }: {
    workspace: Workspace;
    user: User;
  }): number {
    // first check to see if workspace already assigned to this user
    // makes relationship between scheduler and script idempotent
    // wrt assigning users to workspaces
    const isWorkspaceAlreadyAssignedToUser = workspace.assignedTo === user.id;

    if (isWorkspaceAlreadyAssignedToUser) {
      // calculate index of most recent action
      // assigning this user to this workspace
      let i = this.history.actions.length - 1;
      for (; i >= 0; i++) {
        const action = this.history.actions[i];
        if (
          action.actionType === "ASSIGN_USER" &&
          action.userId === user.id &&
          action.workspaceId === workspace.id
        ) {
          break;
        }
      }

      // return index of this action
      return i;
    }

    const action = {
      actionType: "ASSIGN_USER" as "ASSIGN_USER",
      workspaceId: workspace.id,
      userId: user.id,
    };

    this.dispatchAction(action);

    const actionIndex = this.history.actions.length - 1;

    return actionIndex;
  }

  public processReply({
    interaction,
    reply,
  }: {
    interaction: Interaction;
    reply: Reply;
  }): number {
    const assignAction = this.history.actions[
      interaction.internalScriptReference
    ];

    if (!assignAction) {
      throw Error("");
    }

    if (assignAction.actionType !== "ASSIGN_USER") {
      throw Error("");
    }

    const workspace = getAllWorkspaces(this.state).find(
      w => w.id === assignAction.workspaceId,
    );

    if (!workspace) {
      throw Error("Interaction doesn't correspond to a workspace");
    }

    // thanks to the two checks below, relationship between
    // scheduler and script wrt replies is pretty much idempotent

    if (workspace.assignedTo !== assignAction.userId) {
      throw Error("Workspace no longer assigned to user");
    }

    if (!workspace.isActive) {
      throw Error("Workspace no longer active");
    }

    const replyAction = convertReplyIntoAction(reply, workspace);

    this.dispatchAction(replyAction);

    const actionIndex = this.history.actions.length - 1;

    return actionIndex;
  }

  public processAdminAction(action: any) {
    this.dispatchAction(action);
  }

  private reducer(state: State, action: Action): State {
    const newState = rootReducer(state, action);

    deepFreeze(newState); // enforce immutability
    return newState;
  }

  private dispatchAction(action: Action) {
    this.state = this.reducer(this.state, action);

    // record action in script history
    this.history.actions.push(action);
    this.scriptDAO.saveActionToDb(action, this.history.actions.length - 1);
  }
}
