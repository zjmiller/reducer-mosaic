import * as _ from "lodash";

import { MaybeInteraction } from "../interaction/interaction";
import { InteractionRepository } from "../interaction/repository";
import { Reply } from "../reply";
import { RunRepository } from "../run/repository";
import { Template } from "../template/template";
import { Run } from "../run/run";
import { User } from "../user/user";
import { Workspace } from "../workspace/workspace";

type TemplateWithInteractionId = {
  interactionId: string;
  template: Template;
};

type MaybeTemplateWithInteractionId = TemplateWithInteractionId | null;

export class TopLevelScheduler {
  constructor() {
    RunRepository.loadAll();
  }

  public async findWorkForUser(
    user: User,
  ): Promise<MaybeTemplateWithInteractionId> {
    const alreadyAssignedInteraction = await this.findAlreadyAssignedInteractionForUser(
      user,
    );

    if (alreadyAssignedInteraction) {
      const run = await RunRepository.findByPk(
        alreadyAssignedInteraction.runId,
      );

      return {
        interactionId: alreadyAssignedInteraction.id,
        template: run.generateTemplate(alreadyAssignedInteraction),
      };
    } else {
      const runAndWorkspace = await this.findWorkspaceForUser(user);

      if (!runAndWorkspace) {
        return null;
      }

      const { run, workspace } = runAndWorkspace;

      const assignActionIndex = run.assignUserToWorkspace({
        workspace,
        user,
      });

      const interaction = await InteractionRepository.create({
        assignActionIndex,
        runId: run.id,
        userId: user.id,
      });

      return {
        interactionId: interaction.id,
        template: run.generateTemplate(interaction),
      };
    }
  }

  public async processReply({
    interactionId,
    reply,
    user,
  }: {
    interactionId: string;
    reply: Reply;
    user: User;
  }) {
    const interaction = await InteractionRepository.findByPk(interactionId);

    if (!interaction) {
      throw Error("No interaction");
    }

    const run = await RunRepository.findByPk(interaction.runId);

    if (!run) {
      throw Error("No run");
    }

    const replyActionIndex = run.processReply({
      interaction,
      reply,
      user,
    });

    await interaction.complete({ replyActionIndex });
  }

  private async findAlreadyAssignedInteractionForUser(
    user: User,
  ): Promise<MaybeInteraction> {
    const pendingInteractionsForUser = await InteractionRepository.findAll({
      where: {
        userId: user.id,
        endTimestamp: null,
      },
    });

    return pendingInteractionsForUser[0];
  }

  private async findWorkspaceForUser(
    user: User,
  ): Promise<{
    run: Run;
    workspace: Workspace;
  }> {
    const runs = RunRepository.findAll();

    const allEligibleWorkspaces = _.flatten(
      runs.map(run => {
        const workspaces = run.getEligibleWorkspacesForUser(user);
        return workspaces.map(workspace => ({ run, workspace }));
      }),
    );

    return allEligibleWorkspaces[0];
  }
}
