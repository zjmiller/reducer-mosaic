import { RunLevelSchedulerState } from "./run-level-scheduler-state";

import { Interaction, MaybeInteraction } from "../interaction";
import { Reply } from "../reply";
import { IScript } from "../script";
import { User } from "../user";

export interface IRunLevelScheduler {
  getEligibleInteractionsForUser(user: User): Interaction[];

  getAlreadyAssignedInteractionForUser(user: User): MaybeInteraction;

  getState(): RunLevelSchedulerState;

  createCopy(
    newScript: IScript,
    shouldCopyOverState?: boolean,
  ): IRunLevelScheduler;

  processReply({
    interaction,
    reply,
    user,
  }: {
    interaction: Interaction;
    reply: Reply;
    user: User;
  }): void;

  assignUserToInteraction({
    interaction,
    user,
  }: {
    interaction: Interaction;
    user: User;
  }): void;
}
