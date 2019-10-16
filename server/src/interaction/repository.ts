import * as _ from "lodash";

import { Interaction } from "./interaction";

import { Interaction as InteractionModel } from "../db/models/interaction";

export class InteractionDAO {
  constructor(private modelInstance: InteractionModel) {}

  public async update(fields: { endTimestamp: number }) {
    await this.modelInstance.update(fields);
  }
}

const interactions: any[] = [];

export const InteractionRepository = {
  async create({
    internalScriptReference,
    runId,
    userId,
  }: {
    internalScriptReference: number;
    runId: string;
    userId: string;
  }): Promise<Interaction> {
    const interactionModel = await InteractionModel.create({
      internalScriptReference,
      runId,
      startTimestamp: Date.now(),
      userId,
    });

    const interactionDAO = new InteractionDAO(interactionModel);

    const interaction = new Interaction({
      id: interactionModel.id,
      internalScriptReference,
      interactionDAO,
      runId,
      userId,
    });

    interactions.push(interaction);

    return Promise.resolve(interaction);
  },

  async findByPk(pk: string) {
    const cachedInteraction = interactions.find(i => i.id === pk);
    if (cachedInteraction) {
      return cachedInteraction;
    }

    const interactionModel = await InteractionModel.findByPk(pk);
    if (!interactionModel) {
      throw Error("Interaction not found in database");
    }

    const interaction = modelIntoObject(interactionModel);

    interactions.push(interaction);

    return Promise.resolve(interaction);
  },

  async findAll(options: { where: any }) {
    const result = await InteractionModel.findAll(options);

    return result.map(modelIntoObject);
  },
};

function modelIntoObject(interactionModel: InteractionModel) {
  const { internalScriptReference, runId, userId } = interactionModel;

  const interactionDAO = new InteractionDAO(interactionModel);

  const interaction = new Interaction({
    id: interactionModel.id,
    internalScriptReference,
    interactionDAO,
    runId,
    userId,
  });

  return interaction;
}
