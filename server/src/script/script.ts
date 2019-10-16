import { Interaction } from "../interaction/interaction";
import { ScriptHistory } from "./script-history";
import { ScriptState } from "./script-state";
import { Reply } from "../reply";
import { Template } from "../template/template";
import { User } from "../user/user";
import { Workspace } from "../workspace/workspace";

export interface IScript {
  id: string;

  getEligibleWorkspacesForUser(user: User): Workspace[];

  generateTemplate(interaction: Interaction): Template;

  getHistory(): ScriptHistory;

  getState(): ScriptState;

  getPastStateAtIndex(i: number): ScriptState;

  createCopy(i?: number): Promise<IScript>;

  assignUserToWorkspace({
    workspace,
    user,
  }: {
    workspace: Workspace;
    user: User;
  }): number;

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
