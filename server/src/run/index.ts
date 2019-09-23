// tslint:disable-next-line:no-var-requires
const uuidv4 = require("uuid/v4");

import { RunRepository } from "./run-repository";

import { Interaction } from "../interaction";
import { Reply } from "../reply";
import { IRunLevelScheduler } from "../run-level-scheduler";
import { IScript } from "../script";
import { User } from "../user";

export class Run {
  public id: string;

  constructor(
    public script: IScript,
    private runLevelScheduler: IRunLevelScheduler,
  ) {
    this.id = uuidv4();
    RunRepository.addRunToInMemoryCollection(this);
    console.log(`Created run with id ${this.id}`);
  }

  public getEligibleInteractionsForUser(user: User) {
    return this.runLevelScheduler.getEligibleInteractionsForUser(user);
  }

  public getAlreadyAssignedInteractionForUser(user: User) {
    return this.runLevelScheduler.getAlreadyAssignedInteractionForUser(user);
  }

  public getAllInteractions() {
    return this.script.getAllInteractions();
  }

  public generateTemplate(interaction: Interaction) {
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

    return new Run(newScript, newRunLevelScheduler);
  }

  public async createCopyWithNewRunLevelScheduler({
    runLevelScheduler,
    scriptHistoryIndex,
  }: {
    runLevelScheduler: IRunLevelScheduler;
    scriptHistoryIndex: number;
  }) {
    const newScript = await this.script.createCopy(scriptHistoryIndex);

    return new Run(newScript, runLevelScheduler);
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

  public assignUserToInteraction({
    interaction,
    user,
  }: {
    interaction: Interaction;
    user: User;
  }) {
    this.runLevelScheduler.assignUserToInteraction({ interaction, user });
    return this.script.assignUserToInteraction({ interaction, user });
  }

  public processAdminAction(action: any) {
    this.script.processAdminAction(action);
  }
}
