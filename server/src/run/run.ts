import { Interaction } from "../interaction/interaction";
import { Reply } from "../reply";
import { IRunLevelScheduler } from "../run-level-scheduler/run-level-scheduler";
import { IScript } from "../script/script";
import { Template } from "../template/template";
import { User } from "../user/user";
import { RunRepository } from "./repository";
import { Workspace } from "../workspace/workspace";

export class Run {
  constructor(
    public id: string,
    public script: IScript,
    private runLevelScheduler: IRunLevelScheduler,
  ) {}

  public getEligibleWorkspacesForUser(user: User): Workspace[] {
    return this.runLevelScheduler
      .getEligibleWorkspacesForUser(user)
      .map(i => ({ runId: this.id, ...i }));
  }

  public generateTemplate(interaction: Interaction): Template {
    return this.script.generateTemplate(interaction);
  }

  public getScriptState() {
    return this.script.getState();
  }

  public getScriptPastStateAtIndex(i: number) {
    return this.script.getPastStateAtIndex(i);
  }

  public getScriptHistory() {
    return this.script.getHistory();
  }

  public getRunLevelSchedulerState() {
    return this.runLevelScheduler.getState();
  }

  public async createCopy({
    scriptHistoryIndex,
    shouldCopyOverRunLevelSchedulerState,
  }: {
    scriptHistoryIndex: number;
    shouldCopyOverRunLevelSchedulerState?: boolean;
  }) {
    const newScript = await this.script.createCopy(scriptHistoryIndex);
    const newRunLevelScheduler = this.runLevelScheduler.createCopy(
      newScript,
      shouldCopyOverRunLevelSchedulerState,
    );

    return await RunRepository.create(newScript, newRunLevelScheduler);
  }

  public async createCopyWithNewRunLevelScheduler({
    runLevelScheduler,
    scriptHistoryIndex,
  }: {
    runLevelScheduler: IRunLevelScheduler;
    scriptHistoryIndex: number;
  }) {
    const newScript = await this.script.createCopy(scriptHistoryIndex);

    return await RunRepository.create(newScript, runLevelScheduler);
  }

  public processReply({
    interaction,
    reply,
    user,
  }: {
    interaction: Interaction;
    reply: Reply;
    user: User;
  }) {
    this.runLevelScheduler.processReply({ interaction, reply, user });
    this.script.processReply({ interaction, reply, user });
  }

  public assignUserToWorkspace({
    workspace,
    user,
  }: {
    workspace: Workspace;
    user: User;
  }) {
    this.runLevelScheduler.assignUserToWorkspace({ workspace, user });
    return this.script.assignUserToWorkspace({ workspace, user });
  }

  public processAdminAction(action: any) {
    this.script.processAdminAction(action);
  }
}
