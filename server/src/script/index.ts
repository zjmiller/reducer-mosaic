import { ScriptHistory } from "./script-history";
import { ScriptState } from "./script-state";

import { Interaction, MaybeInteraction } from "../interaction";
import { Reply } from "../reply";
import { Template } from "../template-info";
import { User } from "../user";

export interface IScript {
  getAllInteractions(): Interaction[];

  getAlreadyAssignedInteractionForUser(user: User): MaybeInteraction;

  getEligibleInteractionsForUser(user: User): Interaction[];

  generateTemplate(interaction: Interaction): Template;

  getHistory(): ScriptHistory;

  getState(): ScriptState;

  getPastStateAtIndex(i: number): ScriptState;

  createCopy(i?: number): Promise<IScript>;

  assignUserToInteraction({
    interaction,
    user,
  }: {
    interaction: Interaction;
    user: User;
  }): Interaction;

  processReply({
    interaction,
    reply,
    user,
  }: {
    interaction: Interaction;
    reply: Reply;
    user?: User;
  }): void;

  processAdminAction(action: any): void;
}
