import { RunLevelSchedulerState } from "./run-level-scheduler-state";

import { Interaction } from "../interaction/interaction";
import { Reply } from "../reply";
import { IScript } from "../script/script";
import { User } from "../user/user";
import { Workspace } from "../workspace/workspace";

export interface IRunLevelScheduler {
  getEligibleWorkspacesForUser(user: User): Workspace[];

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

  assignUserToWorkspace({
    workspace,
    user,
  }: {
    workspace: Workspace;
    user: User;
  }): void;
}
