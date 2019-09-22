import { Content } from "../../content/content";
import { Interaction } from "../../interaction";

export interface Workspace extends Interaction {
  id: string;
  isActive: boolean;
  assignedTo: string | null;
  containsExports: string[];
  workspaceType: string;
}

export interface JudgeWorkspace extends Workspace {
  workspaceType: "JUDGE";
  parentId: string | null; // two below root-level
  question: Content;
  answerCandidateSelected: number | null;
  shouldShowHonestFirst: boolean | null;
  unlockedExports: string[];
}

export interface HonestWorkspace extends Workspace {
  workspaceType: "HONEST";
  judgeParentId: string | null; // root-level is null
  question: Content;
  answerCandidate: Content | null;
}

export interface MaliciousWorkspace extends Workspace {
  workspaceType: "MALICIOUS";
  judgeParentId: string | null; // one below root-level
  question: Content;
  answerCandidate: Content | null;
  didDeclineToChallenge: boolean | null;
}

export type FactoredEvaluationWorkspace =
  | JudgeWorkspace
  | HonestWorkspace
  | MaliciousWorkspace;
