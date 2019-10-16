import { GraphQLJSON, GraphQLJSONObject } from "graphql-type-json";

import { Reply } from "../reply";
import { Run } from "../run/run";
import { RunRepository } from "../run/repository";
import { TopLevelScheduler } from "../top-level-scheduler/top-level-scheduler";
import { UserRepository } from "../user/user-repository";

export const createResolvers = (topLevelScheduler: TopLevelScheduler): any => ({
  JSON: GraphQLJSON,

  JSONObject: GraphQLJSONObject,

  Mutation: {
    createCopyOfRun: async (
      root: any,
      { runId, index }: { runId: string; index: number },
    ) => {
      const run = await RunRepository.findByPk(runId);
      if (!run) {
        throw Error("Run not found.");
      }
      return !!(await run.createCopy({ scriptHistoryIndex: index }));
    },

    findWorkForUser: async (
      root: any,
      { userEmail }: { userEmail: string },
    ) => {
      const user = await UserRepository.findUserByEmail(userEmail);
      if (!user) {
        throw Error("No user found");
      }
      return topLevelScheduler.findWorkForUser(user);
    },

    submitReply: async (
      root: any,
      {
        interactionId,
        reply,
        userEmail,
      }: { interactionId: string; reply: any; userEmail: string },
    ) => {
      const user = await UserRepository.findUserByEmail(userEmail);
      if (!user) {
        throw Error("No user found");
      }

      topLevelScheduler.processReply({
        interactionId,
        reply: reply as Reply,
        user,
      });
    },

    totalReset: async () => {
      RunRepository.reset();
      return true;
    },

    adminAction: async (
      root: any,
      { runId, action }: { runId: string; action: any },
    ) => {
      const run = await RunRepository.findByPk(runId);
      if (!run) {
        throw Error("Run not found.");
      }
      run.processAdminAction(action);
      return true;
    },
  },

  Query: {
    run: async (root: any, { id }: { id: string }) => {
      const run = await RunRepository.findByPk(id);
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
