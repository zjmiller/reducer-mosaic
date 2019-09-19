import { BasicDecompositionReply } from "./reply";
import { WorkspaceId } from "./workspace";

export type BasicDecompositionAction = ProcessReplyAction | AssignUserAction;

export type ProcessReplyAction = {
  actionType: "REPLY";
  workspaceId: WorkspaceId;
  reply: BasicDecompositionReply;
};

export type AssignUserAction = {
  actionType: "ASSIGN_USER";
  workspaceId: WorkspaceId;
  userId: string;
};
