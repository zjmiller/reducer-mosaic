import { InteractionDAO } from "./repository";

export type InteractionId = string;

export type MaybeInteraction = Interaction | null;

export class Interaction {
  public id: string;
  public internalScriptReference: number;
  public interactionDAO: InteractionDAO; // TODO change to private
  public runId: string;
  public userId: string;

  constructor({
    id,
    internalScriptReference,
    interactionDAO,
    runId,
    userId,
  }: {
    id: string;
    internalScriptReference: number;
    interactionDAO: InteractionDAO;
    runId: string;
    userId: string;
  }) {
    this.id = id;
    this.internalScriptReference = internalScriptReference;
    this.interactionDAO = interactionDAO;
    this.runId = runId;
    this.userId = userId;
  }

  public async complete() {
    await this.interactionDAO.update({
      endTimestamp: Date.now(),
    });
  }
}
