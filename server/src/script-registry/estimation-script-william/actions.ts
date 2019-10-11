import { Reply } from "./templateInterface";
import { Parameters } from "./types";
import { WorkspaceId } from "./workspace";

export type Action =
  {
    actionType: "REPLY";
    workspaceId: WorkspaceId;
    reply: Reply;
  } |
  {
    actionType: "ASSIGN_USER";
    workspaceId: WorkspaceId;
    userId: string;
  } |
  {
    actionType: "SETUP_RUN";
    parameters: Parameters
  };
