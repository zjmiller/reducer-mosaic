import deepFreeze from "deep-freeze";
import produce from "immer";

import { adminReducer } from "./admin-reducer";
import { FactoredEvaluationAction } from "./actions";
import { convertUUIDToCoinflip } from "../helpers/convert-uuid-to-coinflip";
import { createSeededRandomIdGenerator } from "../helpers/create-seeded-random-id-generator";
import { FactoredEvaluationScriptState } from "./index";
import { setupReducer } from "./setup-reducer";
import { ContentParser } from "../../content/content-parser";
import { Content } from "../../content/content";
import { ExportWithContent } from "../../content/export";

export const rootReducer = (
  state: FactoredEvaluationScriptState,
  action: FactoredEvaluationAction,
): FactoredEvaluationScriptState => {
  // Enforce immutability.
  deepFreeze(state);

  if (action.actionType === "SETUP_RUN") {
    return setupReducer(state, action);
  }

  // Pass admin actions off to admin reducer.
  if (action.actionType === "_ADMIN_UN_ASSIGN_ALL") {
    return adminReducer(state, action);
  }

  // We're using immer to immutably change state
  // by "mutating" draft state. We know actual state
  // isn't changing because of deepFreeze.
  const newState = produce(state, draftState => {
    const {
      judgeWorkspaces,
      honestWorkspaces,
      maliciousWorkspaces,
      availableExports,
    } = draftState;

    const allWorkspaces = [
      ...judgeWorkspaces,
      ...honestWorkspaces,
      ...maliciousWorkspaces,
    ];

    const workspace = allWorkspaces.find(w => w.id === action.workspaceId);

    if (!workspace) {
      throw Error("Workspace not found.");
    }

    // All non-admin actions fall into two categories.
    // ASSIGN_USER actions occur after successful scheduling.
    // REPLY actions occur when a user submits a reply to an interaction.
    if (action.actionType === "ASSIGN_USER") {
      workspace.assignedTo = action.userId;
    } else if (action.actionType === "REPLY") {
      const reply = action.reply;

      // In factored evaluation, there are six types of REPLY actions:
      // ----------
      // ASK_QUESTION
      // UNLOCK_EXPORT
      // SELECT_ANSWER_CANDIDATE
      // SUBMIT_HONEST_ANSWER_CANDIDATE
      // SUBMIT_MALICIOUS_ANSWER_CANDIDATE
      // DECLINE_TO_CHALLENGE
      if (reply.replyType === "ASK_QUESTION") {
        if (workspace.workspaceType !== "JUDGE") {
          throw Error("Only a judge workspace can ask a question.");
        }

        const prngId = createSeededRandomIdGenerator(
          draftState.ids.slice(-1)[0],
        );

        const [subQuestion, newExports] = parseStringAndGetNewExports({
          availableExports,
          prngId,
          stringToParse: reply.subQuestion,
        });

        // Keep track of which workspace created which pointers.
        workspace.containsExports.push(...newExports.map(e => e.exportId));

        // Keep track of generated ids
        draftState.ids.push(...newExports.map(e => e.exportId));

        // Add new pointers to the set of all pointers.
        // This is the only place where pointer content is stored.
        availableExports.push(...newExports);

        const honestWorkspaceId = prngId();
        draftState.ids.push(honestWorkspaceId);

        // Create honest workspace.
        const honestWorkspace = {
          answerCandidate: null,
          assignedTo: null,
          containsExports: [],
          id: honestWorkspaceId,
          isActive: true,
          judgeParentId: workspace.id,
          question: subQuestion,
          workspaceType: "HONEST" as "HONEST",
        };

        honestWorkspaces.push(honestWorkspace);

        // Un-assign user.
        workspace.assignedTo = null;

        // Make workspace inactive & ineligible for scheduling.
        workspace.isActive = false;
      } else if (reply.replyType === "UNLOCK_EXPORT") {
        if (workspace.workspaceType !== "JUDGE") {
          throw Error("Only a judge can (and needs to) unlock an export.");
        }

        workspace.unlockedExports.push(reply.exportId);
      } else if (reply.replyType === "SELECT_ANSWER_CANDIDATE") {
        if (workspace.workspaceType !== "JUDGE") {
          throw Error("Only a judge workspace can select an answer candidate.");
        }

        workspace.answerCandidateSelected = reply.answerCandidateSelected;

        // Un-assign user.
        workspace.assignedTo = null;

        // Make workspace inactive & ineligible for scheduling.
        workspace.isActive = false;

        // If workspace has parent, make parent active and eligible for scheduling.
        const parent = judgeWorkspaces.find(w => w.id === workspace.parentId);
        if (parent) {
          parent.isActive = true;
        }
      } else if (reply.replyType === "SUBMIT_HONEST_ANSWER_CANDIDATE") {
        if (workspace.workspaceType !== "HONEST") {
          throw Error(
            "Only an honest workspace can submit an honest answer candidate.",
          );
        }

        const prngId = createSeededRandomIdGenerator(
          draftState.ids.slice(-1)[0],
        );

        const [answerCandidate, newExports] = parseStringAndGetNewExports({
          stringToParse: reply.answerCandidate,
          availableExports,
          prngId,
        });

        // Keep track of generated ids
        draftState.ids.push(...newExports.map(e => e.exportId));

        // Keep track of which workspace created which pointers.
        workspace.containsExports.push(...newExports.map(e => e.exportId));

        // Add new pointers to set of all pointers.
        // This is the only place where pointer content is stored.
        availableExports.push(...newExports);

        workspace.answerCandidate = answerCandidate;

        const maliciousWorkspaceId = prngId();
        draftState.ids.push(maliciousWorkspaceId);

        // Create malicious workspace.
        const maliciousWorkspace = {
          answerCandidate: null,
          assignedTo: null,
          containsExports: [],
          didDeclineToChallenge: null,
          id: maliciousWorkspaceId,
          isActive: true,
          judgeParentId: workspace.judgeParentId,
          question: workspace.question,
          workspaceType: "MALICIOUS" as "MALICIOUS",
        };

        maliciousWorkspaces.push(maliciousWorkspace);

        // Un-assign user.
        workspace.assignedTo = null;

        // Make workspace inactive & ineligible for scheduling.
        workspace.isActive = false;
      } else if (reply.replyType === "SUBMIT_MALICIOUS_ANSWER_CANDIDATE") {
        if (workspace.workspaceType !== "MALICIOUS") {
          throw Error(
            "Only a malicious workspace can submit a malicious answer candidate.",
          );
        }

        const prngId = createSeededRandomIdGenerator(
          draftState.ids.slice(-1)[0],
        );

        const [answerCandidate, newExports] = parseStringAndGetNewExports({
          availableExports,
          prngId,
          stringToParse: reply.answerCandidate,
        });

        // Keep track of which workspace created which pointers.
        workspace.containsExports.push(...newExports.map(e => e.exportId));

        // Keep track of generated ids
        draftState.ids.push(...newExports.map(e => e.exportId));

        // Add new pointers to set of all pointers.
        // This is the only place where pointer content is stored.
        availableExports.push(...newExports);

        workspace.answerCandidate = answerCandidate;

        const judgeWorkspaceId = prngId();
        draftState.ids.push(judgeWorkspaceId);

        // Create judge workspace.
        const judgeWorkspace = {
          answerCandidateSelected: null,
          assignedTo: null,
          containsExports: [],
          id: judgeWorkspaceId,
          isActive: true,
          parentId: workspace.judgeParentId,
          question: workspace.question,
          shouldShowHonestFirst: convertUUIDToCoinflip(prngId()),
          unlockedExports: [],
          workspaceType: "JUDGE" as "JUDGE",
        };

        judgeWorkspaces.push(judgeWorkspace);

        // Un-assign user.
        workspace.assignedTo = null;

        // Make workspace inactive & ineligible for scheduling.
        workspace.isActive = false;
      } else if (reply.replyType === "DECLINE_TO_CHALLENGE") {
        if (workspace.workspaceType !== "MALICIOUS") {
          throw Error("Only a malicious workspace can decline to challenge.");
        }

        workspace.didDeclineToChallenge = true;

        // Un-assign user.
        workspace.assignedTo = null;

        // Make workspace inactive & ineligible for scheduling.
        workspace.isActive = false;

        // If workspace has judge parent, make it active and eligible for scheduling.
        const parent = judgeWorkspaces.find(
          w => w.id === workspace.judgeParentId,
        );
        if (parent) {
          parent.isActive = true;
        }
      } else {
        throw Error("Unrecognized reply type");
      }
    }
  });

  return newState;
};

function parseStringAndGetNewExports({
  stringToParse,
  availableExports,
  prngId,
}: {
  stringToParse: string;
  availableExports: ExportWithContent[];
  prngId: () => string;
}): [Content, ExportWithContent[]] {
  const parser = new ContentParser(stringToParse, availableExports, prngId);
  return [parser.parse(), parser.getNewPointers()];
}
