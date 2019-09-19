// tslint:disable:no-empty

import { Interaction } from "../interaction";
import { Reply } from "../reply";
import { IRunLevelScheduler } from "../run-level-scheduler";
import { RunLevelSchedulerState } from "../run-level-scheduler/run-level-scheduler-state";
import { IScript } from "../script";
import { User } from "../user";

export class TrivialRunLevelScheduler implements IRunLevelScheduler {
  private script: IScript;
  private state: RunLevelSchedulerState;

  constructor(script: IScript, state?: RunLevelSchedulerState) {
    this.script = script;
    this.state = state === undefined ? null : state;
  }

  public getEligibleInteractionsForUser(user: User) {
    return this.script.getEligibleInteractionsForUser(user);
  }

  public getAlreadyAssignedInteractionForUser(user: User) {
    return this.script.getAlreadyAssignedInteractionForUser(user);
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

  public assignUserToInteraction({
    interaction,
    user,
  }: {
    interaction: Interaction;
    user: User;
  }) {}
}
