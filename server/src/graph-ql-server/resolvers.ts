import { GraphQLJSON, GraphQLJSONObject } from "graphql-type-json";

import { createFactoredEvaluationRun } from "../create-factored-evaluation-run";
import { Reply } from "../reply";
import { Run } from "../run";
import { RunRepository } from "../run/run-repository";
import { TopLevelScheduler } from "../top-level-scheduler";
import { UserRepository } from "../user/user-repository";

export const createResolvers = (topLevelScheduler: TopLevelScheduler): any => ({
  JSON: GraphQLJSON,

  JSONObject: GraphQLJSONObject,

  Mutation: {
    createCopyOfRun: async (
      root: any,
      { runId, index }: { runId: string; index: number },
    ) => {
      const run = await RunRepository.findRunByPk(runId);
      if (!run) {
        throw Error("Run not found.");
      }
      return !!(await run.createCopy({ scriptHistoryIndex: index }));
    },

    findWorkForUser: async (root: any, { userId }: { userId: string }) => {
      const user = await UserRepository.findUserByPk(userId);
      if (!user) {
        throw Error("No user found");
      }
      return topLevelScheduler.findWorkForUser(user);
    },

    submitReply: async (
      root: any,
      { reply, userId }: { reply: any; userId: string },
    ) => {
      const user = await UserRepository.findUserByPk(userId);
      if (!user) {
        throw Error("No user found");
      }

      topLevelScheduler.processReply({ reply: reply as Reply, user });
    },

    totalReset: async () => {
      RunRepository.reset();
      createFactoredEvaluationRun();
      return true;
    },

    adminAction: async (
      root: any,
      { runId, action }: { runId: string; action: any },
    ) => {
      const run = await RunRepository.findRunByPk(runId);
      if (!run) {
        throw Error("Run not found.");
      }
      run.processAdminAction(action);
      return true;
    },
  },

  Query: {
    run: async (root: any, { id }: { id: string }) => {
      const run = await RunRepository.findRunByPk(id);
      if (!run) {
        throw Error("Run not found.");
      }
      return run;
    },
    runs: (root: any) => {
      const runs = RunRepository.findAll();

      return runs;
    },
  },

  Run: {
    history: (run: Run) => {
      return run.getScriptHistory();
    },
    pastState: (run: Run, { index }: { index: number }) => {
      return run.getScriptPastStateAtIndex(index);
    },
    state: (run: Run) => {
      return run.getScriptState();
    },
  },
});
