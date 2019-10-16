import { InteractionDAO } from "./repository";

export type InteractionId = string;

export type MaybeInteraction = Interaction | null;

export class Interaction {
  public assignActionIndex: number;
  public id: string;
  public interactionDAO: InteractionDAO; // TODO change to private
  public runId: string;
  public userId: string;

  constructor({
    assignActionIndex,
    id,
    interactionDAO,
    runId,
    userId,
  }: {
    assignActionIndex: number;
    id: string;
    interactionDAO: InteractionDAO;
    runId: string;
    userId: string;
  }) {
    this.assignActionIndex = assignActionIndex;
    this.id = id;
    this.interactionDAO = interactionDAO;
    this.runId = runId;
    this.userId = userId;
  }

  public async complete({ replyActionIndex }: { replyActionIndex: number }) {
    await this.interactionDAO.update({
      endTimestamp: Date.now(),
      replyActionIndex,
    });
  }
}
