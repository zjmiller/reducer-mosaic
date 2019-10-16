// tslint:disable:no-empty

import { Interaction } from "../interaction/interaction";
import { Reply } from "../reply";
import { IRunLevelScheduler } from "../run-level-scheduler/run-level-scheduler";
import { RunLevelSchedulerState } from "../run-level-scheduler/run-level-scheduler-state";
import { IScript } from "../script/script";
import { User } from "../user/user";
import { Workspace } from "../workspace/workspace";

export class TrivialRunLevelScheduler implements IRunLevelScheduler {
  private script: IScript;
  private state: RunLevelSchedulerState;

  constructor(script: IScript, state?: RunLevelSchedulerState) {
    this.script = script;
    this.state = state === undefined ? null : state;
  }

  public getEligibleWorkspacesForUser(user: User) {
    return this.script.getEligibleWorkspacesForUser(user);
  }

  public getState() {
    return this.state;
  }

  public createCopy(newScript: IScript, shouldCopyState?: boolean) {
    if (shouldCopyState) {
      // state should be copied but since is always null here is immutable
      return new TrivialRunLevelScheduler(newScript, this.state);
    }

    return new TrivialRunLevelScheduler(newScript);
  }

  public processReply({
    interaction,
    reply,
    user,
  }: {
    interaction: Interaction;
    reply: Reply;
    user: User;
  }) {}

  public assignUserToWorkspace({
    workspace,
    user,
  }: {
    workspace: Workspace;
    user: User;
  }) {}
}
