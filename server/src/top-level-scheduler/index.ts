import { Interaction, MaybeInteraction } from "../interaction";
import { Reply } from "../reply";
import { RunRepository } from "../run/run-repository";
import { MaybeTemplate } from "../template-info";
import { User } from "../user";

export class TopLevelScheduler {
  public findWorkForUser(user: User): MaybeTemplate {
    let interaction: Interaction;
    let isInteractionAlreadyAssigned: boolean;

    const maybeAlreadyAssignedInteraction = this.findAlreadyAssignedInteractionForUser(
      user,
    );

    if (maybeAlreadyAssignedInteraction) {
      isInteractionAlreadyAssigned = true;
      interaction = maybeAlreadyAssignedInteraction;
    } else {
      isInteractionAlreadyAssigned = false;
      interaction = this.findNewInteractionForUser(user);

      if (!interaction) {
        throw Error("No interaction found");
      }
    }

    const run = this.findRunThatContainsInteraction(interaction);
    if (!run) {
      throw Error("Interaction not associated with run");
    }

    if (!isInteractionAlreadyAssigned) {
      interaction = run.assignUserToInteraction({
        interaction,
        user,
      });
    }

    return run.generateTemplate(interaction);
  }

  public processReply({ reply, user }: { reply: Reply; user: User }) {
    const interaction = this.findAlreadyAssignedInteractionForUser(user);
    if (!interaction) {
      throw Error("No interaction");
    }

    const run = this.findRunThatContainsInteraction(interaction);
    if (!run) {
      throw Error("No run");
    }

    run.processReply({ interaction, reply, user });
  }

  private findAlreadyAssignedInteractionForUser(user: User): MaybeInteraction {
    const runs = RunRepository.findAll();

    const allEligibleInteractions = runs.reduce(
      (acc, run) => {
        const interaction = run.getAlreadyAssignedInteractionForUser(user);

        if (!interaction) {
          return acc;
        }

        return [...acc, interaction];
      },
      [] as Interaction[],
    );

    return allEligibleInteractions.length > 0
      ? allEligibleInteractions[0]
      : null;
  }

  private findNewInteractionForUser(user: User) {
    const runs = RunRepository.findAll();

    const allEligibleInteractions = runs.reduce(
      (acc, run) => {
        return acc.concat(run.getEligibleInteractionsForUser(user));
      },
      [] as Interaction[],
    );

    return allEligibleInteractions[0];
  }

  private findRunThatContainsInteraction(interaction: Interaction) {
    const runs = RunRepository.findAll();

    return runs.find(r => {
      const interactions = r.getAllInteractions();
      return interactions.some(i => i === interaction);
    });
  }
}
