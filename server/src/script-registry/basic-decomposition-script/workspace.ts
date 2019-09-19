import { Interaction } from "../../interaction";

export type WorkspaceId = string;

export type WorkspaceTemplate = {
  templateIdentifier: "WORKSPACE_TEMPLATE";
  templateData: {
    id: string;
    question: string;
    subQuestions: Array<{
      question: string;
      answer: string | null;
    }>;
  };
};

export interface Workspace extends Interaction {
  subQuestions: WorkspaceId[];
  answer: string | null;
  isActive: boolean;
  id: string;
  parentId: string | null;
  question: string;
  assignedTo: string | null;
}
