import { Interaction, InteractionId } from "../../interaction";
import { Reply, Template, WorkspaceData } from "./templateInterface";

export type WorkspaceId = InteractionId;

export interface WorkspaceInteraction {
    template: Template;
    userId?: string;
    reply?: Reply;
}

export interface Workspace {
    id: WorkspaceId;
    workspaceType: string;
    interactions: WorkspaceInteraction[];
    data: WorkspaceData;
    parentId?: WorkspaceId;
    children: WorkspaceId[];
}