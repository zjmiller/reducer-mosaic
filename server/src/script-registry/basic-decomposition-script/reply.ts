export type BasicDecompositionReply =
  | BasicDecompositionAskSubQuestion
  | BasicDecompositionSubmitAnswer;

export type BasicDecompositionAskSubQuestion = {
  replyType: "ASK_QUESTION";
  subQuestion: string;
};

export type BasicDecompositionSubmitAnswer = {
  replyType: "SUBMIT_ANSWER";
  answer: string;
};
