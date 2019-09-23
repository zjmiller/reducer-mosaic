import { Experts } from "./index";
import { FactoredEvaluationReply } from "./reply";
import { WorkspaceId } from "./workspace";

export type FactoredEvaluationAction =
  | AdminUnassignAllAction
  | RunSetupAction
  | ProcessReplyAction
  | AssignUserAction;

export type AdminUnassignAllAction = {
  actionType: "_ADMIN_UN_ASSIGN_ALL";
};

export type RunSetupAction = {
  actionType: "SETUP_RUN";
  rootLevelQuestion: string;
  experts: Experts;
};

export type ProcessReplyAction = {
  actionType: "REPLY";
  workspaceId: WorkspaceId;
  reply: FactoredEvaluationReply;
};

export type AssignUserAction = {
  actionType: "ASSIGN_USER";
  workspaceId: WorkspaceId;
  userId: string;
};
