import { Content } from "../../content/content";
import { Interaction } from "../../interaction";

export type WorkspaceId = string;

export interface Workspace extends Interaction {
  id: WorkspaceId;
  isActive: boolean;
  assignedTo: string | null;
  containsExports: string[];
  workspaceType: string;
}

export interface JudgeWorkspace extends Workspace {
  workspaceType: "JUDGE";
  parentId: WorkspaceId | null; // two below root-level
  question: Content;
  answerCandidateSelected: number | null;
  shouldShowHonestFirst: boolean | null;
  unlockedExports: string[];
}

export interface HonestWorkspace extends Workspace {
  workspaceType: "HONEST";
  judgeParentId: WorkspaceId | null; // root-level is null
  question: Content;
  answerCandidate: Content | null;
}

export interface MaliciousWorkspace extends Workspace {
  workspaceType: "MALICIOUS";
  judgeParentId: WorkspaceId | null; // one below root-level
  question: Content;
  answerCandidate: Content | null;
  didDeclineToChallenge: boolean | null;
}

export type FactoredEvaluationWorkspace =
  | JudgeWorkspace
  | HonestWorkspace
  | MaliciousWorkspace;
