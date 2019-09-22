import { getMaybeAnswerContentOfSubQuestion } from "./getMaybeAnswerContentOfSubQuestion";

import { FactoredEvaluationScriptState } from "../index";
import {
  HonestWorkspace,
  JudgeWorkspace,
  MaliciousWorkspace,
  Workspace,
} from "../workspace";

import { Content } from "../../../content/content";

export const getAccessibleContentsOfWorkspace = (
  workspace: Workspace,
  state: FactoredEvaluationScriptState,
): Content[] => {
  let contents: Content[] = [];

  const { workspaceType } = workspace;

  if (workspaceType === "JUDGE") {
    const judgeWorkspace = workspace as JudgeWorkspace;

    contents.push(judgeWorkspace.question);

    const associatedHonest = state.honestWorkspaces.find(
      honest => honest.judgeParentId === judgeWorkspace.parentId,
    );

    const associatedMalicious = state.maliciousWorkspaces.find(
      malicious => malicious.judgeParentId === judgeWorkspace.parentId,
    );

    if (judgeWorkspace.shouldShowHonestFirst) {
      if (associatedHonest && associatedHonest.answerCandidate) {
        contents.push(associatedHonest.answerCandidate);
      }
      if (associatedMalicious && associatedMalicious.answerCandidate) {
        contents.push(associatedMalicious.answerCandidate);
      }
    } else {
      if (associatedMalicious && associatedMalicious.answerCandidate) {
        contents.push(associatedMalicious.answerCandidate);
      }
      if (associatedHonest && associatedHonest.answerCandidate) {
        contents.push(associatedHonest.answerCandidate);
      }
    }

    const subQuestions = state.honestWorkspaces.filter(
      honest => honest.judgeParentId === workspace.id,
    );
    contents.push(...subQuestions.map(honest => honest.question));

    const subQuestionMaybeAnswers = subQuestions.map(sq =>
      getMaybeAnswerContentOfSubQuestion(sq, state),
    );
    subQuestionMaybeAnswers.forEach(
      maybeAnswer => maybeAnswer && contents.push(maybeAnswer),
    );
  } else if (workspaceType === "HONEST") {
    const honestWorkspace = workspace as HonestWorkspace;

    contents.push(honestWorkspace.question);

    if (honestWorkspace.answerCandidate) {
      contents.push(honestWorkspace.answerCandidate);
    }
  } else if (workspaceType === "MALICIOUS") {
    const maliciousWorkspace = workspace as MaliciousWorkspace;

    contents.push(maliciousWorkspace.question);

    if (maliciousWorkspace.answerCandidate) {
      contents.push(maliciousWorkspace.answerCandidate);
    }
  }

  return contents;
};
