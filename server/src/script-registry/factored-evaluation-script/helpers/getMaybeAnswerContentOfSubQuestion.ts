import { FactoredEvaluationScriptState } from "../index";
import { HonestWorkspace } from "../workspace";

import { Content } from "../../../content/content";

export function getMaybeAnswerContentOfSubQuestion(
  honest: HonestWorkspace,
  state: FactoredEvaluationScriptState,
): Content | null {
  const honestAnswerCandidate = honest.answerCandidate;

  if (!honestAnswerCandidate) {
    return null;
  }

  const malicious = state.maliciousWorkspaces.find(
    w => w.judgeParentId === honest.judgeParentId,
  );

  if (!malicious) {
    return null;
  }

  const didMaliciousDeclineToChallenge = malicious.didDeclineToChallenge;

  if (didMaliciousDeclineToChallenge) {
    return honest.answerCandidate;
  }

  const judge = state.judgeWorkspaces.find(
    w => w.parentId === honest.judgeParentId,
  );

  if (!judge) {
    throw Error("Todo: shouldn't happen.");
  }

  const didSelectFirstAnswerCandidate = judge.answerCandidateSelected === 1;

  const didSelectHonestAnswerCandidate =
    (didSelectFirstAnswerCandidate && judge.shouldShowHonestFirst) ||
    (!didSelectFirstAnswerCandidate && !judge.shouldShowHonestFirst);

  const answer = didSelectHonestAnswerCandidate
    ? honest.answerCandidate
    : malicious.answerCandidate;

  return answer;
}
