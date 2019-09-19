import gql from "graphql-tag";
import React, { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Button, Card, TextField } from "@material-ui/core";

import { Content } from "../../Content";

import { GUEST_USER_ID } from "../../../config";

const REPLY = gql`
  mutation($reply: JSON, $userId: ID) {
    submitReply(reply: $reply, userId: $userId)
  }
`;

interface WorkspaceTemplateProps {
  data: any;
  endTemplateSession(): void;
}

export const HonestWorkspaceTemplate: React.FC<WorkspaceTemplateProps> = ({
  data,
  endTemplateSession
}) => {
  const { question, availableExports } = data;

  const [answerCandidateContent, setAnswerCandidateContent] = useState("");

  const [submitAnswerCandidate] = useMutation(REPLY, {
    variables: {
      reply: {
        replyType: "SUBMIT_HONEST_ANSWER_CANDIDATE",
        answerCandidate: answerCandidateContent
      },
      userId: GUEST_USER_ID
    }
  });

  return (
    <Card style={{ marginTop: "20px", padding: "20px" }}>
      <h3 style={{ color: "#070", marginBottom: "15px" }}>Honest Workspace</h3>
      <h3>Question</h3>
      <Content content={question} availableExports={availableExports} />
      <div style={{ marginTop: "20px" }}>
        <h3>Answer Candidate</h3>
        <TextField
          fullWidth
          onChange={e => setAnswerCandidateContent(e.target.value)}
          value={answerCandidateContent}
          variant="outlined"
        />
        <Button
          color="primary"
          onClick={() => submitAnswerCandidate() && endTemplateSession()}
          style={{ marginTop: "5px" }}
          variant="contained"
        >
          Submit
        </Button>
      </div>
    </Card>
  );
};
