import {
  IReplyAction,
  IGenerateQuestionsReply,
  Workspace,
  Reply,
} from "./types";

export function convertReplyIntoAction(reply: Reply, workspace: Workspace) {
  if (reply.replyType === "InitialQuestions") {
    const questions = reply.questions;

    const actionReply: IGenerateQuestionsReply = {
      replyType: "GENERATE_QUESTIONS" as "GENERATE_QUESTIONS",
      questions,
    };

    const action: IReplyAction = {
      actionType: "REPLY" as "REPLY",
      workspaceId: workspace.id,
      reply: actionReply,
    };

    return action;
  } else if (reply.replyType === "FormalQuestion") {
    if (
      workspace.workspaceType === "FORMALIZE_QUESTION_WORKSPACE" &&
      !workspace.isUnderReview
    ) {
      const actionReply = {
        replyType: "FORMALIZE_QUESTION" as "FORMALIZE_QUESTION",
        formalizedQuestion: reply.question,
        initialComments: reply.comments,
      };

      const action: IReplyAction = {
        actionType: "REPLY" as "REPLY",
        workspaceId: workspace.id,
        reply: actionReply,
      };

      return action;
    } else {
      const actionReply = {
        replyType: "REVIEW_FORMALIZED_QUESTION" as "REVIEW_FORMALIZED_QUESTION",
        formalizedQuestion: reply.question,
        reviewerComments: reply.comments,
      };

      return {
        actionType: "REPLY" as "REPLY",
        workspaceId: workspace.id,
        reply: actionReply,
      };
    }
  } else if (reply.replyType === "InvalidQuestion") {
    if (workspace.workspaceType === "FORMALIZE_QUESTION_WORKSPACE") {
      if (!workspace.isUnderReview) {
        const actionReply = {
          replyType: "FORMALIZE_QUESTION" as "FORMALIZE_QUESTION",
          isInvalid: true,
          initialComments: reply.comments,
        };

        return {
          actionType: "REPLY" as "REPLY",
          workspaceId: workspace.id,
          reply: actionReply,
        };
      } else {
        const actionReply = {
          replyType: "REVIEW_FORMALIZED_QUESTION" as "REVIEW_FORMALIZED_QUESTION",
          isInvalid: true,
          reviewerComments: reply.comments,
        };

        return {
          actionType: "REPLY" as "REPLY",
          workspaceId: workspace.id,
          reply: actionReply,
        };
      }
    } else if (workspace.workspaceType === "DECOMPOSITION_WORKSPACE") {
      if (!workspace.isUnderReview) {
        const actionReply = {
          replyType: "DECOMPOSE_QUESTION" as "DECOMPOSE_QUESTION",
          isInvalid: true,
          initialComments: reply.comments,
        };

        return {
          actionType: "REPLY" as "REPLY",
          workspaceId: workspace.id,
          reply: actionReply,
        };
      } else {
        const actionReply = {
          replyType: "DECOMPOSE_QUESTION" as "DECOMPOSE_QUESTION",
          isInvalid: true,
          reviewerComments: reply.comments,
        };

        return {
          actionType: "REPLY" as "REPLY",
          workspaceId: workspace.id,
          reply: actionReply,
        };
      }
    }
  } else if (reply.replyType === "Decomposition") {
    if (
      workspace.workspaceType === "DECOMPOSITION_WORKSPACE" &&
      !workspace.isUnderReview
    ) {
      const actionReply = {
        replyType: "DECOMPOSE_QUESTION" as "DECOMPOSE_QUESTION",
        subquestions: reply.subquestions,
        aggregation: reply.aggregation,
        initialComments: reply.comments,
      };

      return {
        actionType: "REPLY" as "REPLY",
        workspaceId: workspace.id,
        reply: actionReply,
      };
    } else {
      const actionReply = {
        replyType: "REVIEW_DECOMPOSED_QUESTION" as "REVIEW_DECOMPOSED_QUESTION",
        subquestions: reply.subquestions,
        aggregation: reply.aggregation,
        reviewerComments: reply.comments,
      };

      return {
        actionType: "REPLY" as "REPLY",
        workspaceId: workspace.id,
        reply: actionReply,
      };
    }
  } else if (reply.replyType === "Answer") {
    if (
      workspace.workspaceType === "DECOMPOSITION_WORKSPACE" &&
      !workspace.isUnderReview
    ) {
      const actionReply = {
        replyType: "DECOMPOSE_QUESTION" as "DECOMPOSE_QUESTION",
        didPass: true,
        initialComments: reply.comments,
      };

      return {
        actionType: "REPLY" as "REPLY",
        workspaceId: workspace.id,
        reply: actionReply,
      };
    } else {
      const actionReply = {
        replyType: "REVIEW_DECOMPOSED_QUESTION" as "REVIEW_DECOMPOSED_QUESTION",
        didPass: true,
        reviewerComments: reply.comments,
      };

      return {
        actionType: "REPLY" as "REPLY",
        workspaceId: workspace.id,
        reply: actionReply,
      };
    }
  }

  throw Error("Reply couldn't be mapped to an action");
}
