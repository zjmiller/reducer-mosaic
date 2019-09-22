import { getAccessibleContentsOfWorkspace } from "./helpers/getAccessibleContentsOfWorkspace";
import { getMaybeAnswerContentOfSubQuestion } from "./helpers/getMaybeAnswerContentOfSubQuestion";
import { FactoredEvaluationScriptState } from "./index";
import { FactoredEvaluationWorkspace } from "./workspace";

import { Content } from "../../content/content";
import { getAccessibleExportIds } from "../../content/helpers/getAccessibleExportIds";

import {
  ExportMaybeWithContent,
  ExportWithContent,
} from "../../content/export";

import {
  JUDGE_WORKSPACE_TEMPLATE,
  HONEST_WORKSPACE_TEMPLATE,
  MALICIOUS_WORKSPACE_TEMPLATE,
} from "../../template-identifiers";

export type WorkspaceId = string;

export type JudgeWorkspaceTemplate = {
  templateIdentifier: "JUDGE_WORKSPACE_TEMPLATE";
  templateData: {
    id: string;
    question: Content;
    answerCandidate1?: Content;
    answerCandidate2?: Content;
    subQuestions: Array<{
      question: Content;
      answer: Content | null;
    }>;
    availableExports: ExportMaybeWithContent[];
    unlockedExports: string[];
  };
};

export type HonestWorkspaceTemplate = {
  templateIdentifier: "HONEST_WORKSPACE_TEMPLATE";
  templateData: {
    id: string;
    question: Content;
    availableExports: ExportWithContent[];
  };
};

export type MaliciousWorkspaceTemplate = {
  templateIdentifier: "MALICIOUS_WORKSPACE_TEMPLATE";
  templateData: {
    id: string;
    question: Content;
    honestAnswerCandidate: Content;
    availableExports: ExportWithContent[];
  };
};

export type FactoredEvaluationWorkspaceTemplate =
  | JudgeWorkspaceTemplate
  | HonestWorkspaceTemplate
  | MaliciousWorkspaceTemplate;

export const generateTemplate = (
  workspace: FactoredEvaluationWorkspace,
  state: FactoredEvaluationScriptState,
): FactoredEvaluationWorkspaceTemplate => {
  if (workspace.workspaceType === "HONEST") {
    return {
      templateIdentifier: HONEST_WORKSPACE_TEMPLATE,
      templateData: {
        id: workspace.id,
        question: workspace.question,
        availableExports: state.availableExports,
      },
    };
  } else if (workspace.workspaceType === "MALICIOUS") {
    const honestWorkspace = state.honestWorkspaces.find(
      w => w.judgeParentId === workspace.judgeParentId,
    );

    if (!honestWorkspace) {
      throw Error(
        "Honest workspace associated with malicious workspace not found.",
      );
    }

    if (!honestWorkspace.answerCandidate) {
      throw Error(
        "Honest answer candidate must be non-null before generating malicious template.",
      );
    }

    return {
      templateIdentifier: MALICIOUS_WORKSPACE_TEMPLATE,
      templateData: {
        id: workspace.id,
        question: workspace.question,
        honestAnswerCandidate: honestWorkspace.answerCandidate,
        availableExports: state.availableExports,
      },
    };
  }

  // If not honest or malicious, then judge.
  // This is more logic-heavy than honest and malicious.
  const honestWorkspace = state.honestWorkspaces.find(
    w => w.judgeParentId === workspace.parentId,
  );

  const honestAnswerCandidate =
    honestWorkspace && honestWorkspace.answerCandidate;

  const maliciousWorkspace = state.maliciousWorkspaces.find(
    w => w.judgeParentId === workspace.parentId,
  );

  const maliciousAnswerCandidate =
    maliciousWorkspace && maliciousWorkspace.answerCandidate;

  if (
    !honestAnswerCandidate ||
    !maliciousAnswerCandidate ||
    workspace.shouldShowHonestFirst === undefined
  ) {
    throw Error("Todo: shouldn't happen.");
  }

  const subQuestions = state.honestWorkspaces
    .filter(w => w.judgeParentId === workspace.id)
    .map(honest => {
      const answer = getMaybeAnswerContentOfSubQuestion(honest, state);

      return {
        question: honest.question,
        answer,
      };
    });

  const accessibleContentsOfWorkspace = getAccessibleContentsOfWorkspace(
    workspace,
    state,
  );

  const accessibleExportIds: string[] = [];
  accessibleContentsOfWorkspace.forEach(content => {
    accessibleExportIds.push(
      ...getAccessibleExportIds(
        content,
        workspace.containsExports,
        workspace.unlockedExports,
        state.availableExports,
      ),
    );
  });

  const availableExports = accessibleExportIds.map(exportId => {
    const exportWithContent = state.availableExports.find(
      e => e.exportId === exportId,
    );
    return {
      // Only send export content if either the workspace introduced the export
      // or a judge has unlocked the export.
      content:
        workspace.containsExports.includes(exportId) ||
        workspace.unlockedExports.includes(exportId)
          ? exportWithContent && exportWithContent.content
          : undefined,
      exportId,
    };
  });

  return {
    templateIdentifier: JUDGE_WORKSPACE_TEMPLATE,
    templateData: {
      answerCandidate1: workspace.shouldShowHonestFirst
        ? honestAnswerCandidate
        : maliciousAnswerCandidate,
      answerCandidate2: workspace.shouldShowHonestFirst
        ? maliciousAnswerCandidate
        : honestAnswerCandidate,
      availableExports,
      id: workspace.id,
      subQuestions,
      question: workspace.question,
      unlockedExports: workspace.unlockedExports,
    },
  };
};
