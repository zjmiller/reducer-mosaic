import { ExpertAssignments } from "./index";
import {
  JudgeWorkspace,
  HonestWorkspace,
  MaliciousWorkspace,
} from "./workspace";
import { ExportWithContent } from "../../content/export";

export const generateInitialState = ({
  initialExperts,
  prngId,
  rootLevelQuestion,
}: {
  initialExperts: ExpertAssignments;
  prngId: () => string;
  rootLevelQuestion: string;
}) => {
  const rootWorkspaceId = prngId();

  const rootWorkspace = {
    id: rootWorkspaceId,
    isActive: true,
    assignedTo: null,
    containsExports: [],

    workspaceType: "HONEST" as "HONEST",
    judgeParentId: null,
    question: [
      { contentType: "TEXT", text: rootLevelQuestion || "Root level" },
    ],
    answerCandidate: null,
  };

  return {
    judgeWorkspaces: [] as JudgeWorkspace[],
    honestWorkspaces: [rootWorkspace] as HonestWorkspace[],
    maliciousWorkspaces: [] as MaliciousWorkspace[],
    experts: initialExperts,
    availableExports: [] as ExportWithContent[],
  };
};
