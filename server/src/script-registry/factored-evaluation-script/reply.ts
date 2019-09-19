export type FactoredEvaluationReply =
  | AskSubQuestion
  | UnlockExport
  | SelectAnswerCandidate
  | SubmitHonestAnswerCandidate
  | SubmitMaliciousAnswerCandidate
  | DeclineToChallenge;

export type AskSubQuestion = {
  replyType: "ASK_QUESTION";
  subQuestion: string;
};

export type UnlockExport = {
  replyType: "UNLOCK_EXPORT";
  exportId: string;
};

export type SelectAnswerCandidate = {
  replyType: "SELECT_ANSWER_CANDIDATE";
  answerCandidateSelected: number; // either 1 or 2
};

export type SubmitHonestAnswerCandidate = {
  replyType: "SUBMIT_HONEST_ANSWER_CANDIDATE";
  answerCandidate: string;
};

export type SubmitMaliciousAnswerCandidate = {
  replyType: "SUBMIT_MALICIOUS_ANSWER_CANDIDATE";
  answerCandidate: string;
};

export type DeclineToChallenge = {
  replyType: "DECLINE_TO_CHALLENGE";
};
