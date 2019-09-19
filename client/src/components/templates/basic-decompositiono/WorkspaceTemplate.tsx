import gql from "graphql-tag";
import React, { useState } from "react";
import { useMutation } from "@apollo/react-hooks";
import { Button, Card, TextField } from "@material-ui/core";

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

const SubQuestion: React.FC<any> = ({ subQuestion }) => {
  const { question, answer } = subQuestion;
  return (
    <div
      style={{
        backgroundColor: "rgba(0,0,0, 0.1)",
        borderLeft: "3px solid gray",
        marginTop: "10px",
        padding: "10px",
        paddingLeft: "20px"
      }}
    >
      <div
        style={{
          display: "flex",
          marginBottom: "8px"
        }}
      >
        <div
          style={{
            flex: "0 0 auto",
            fontWeight: 600,
            marginRight: "12px",
            textAlign: "right",
            width: "90px"
          }}
        >
          Question
        </div>
        <div style={{ flex: "1 1 auto" }}>{question}</div>
      </div>
      <div style={{ display: "flex" }}>
        <div
          style={{
            flex: "0 0 auto",
            fontWeight: 600,
            marginRight: "12px",
            textAlign: "right",
            width: "90px"
          }}
        >
          Answer
        </div>
        <div style={{ flex: "1 1 auto" }}>
          {answer ? answer : <em style={{ color: "#999" }}>no answer yet</em>}
        </div>
      </div>
    </div>
  );
};

export const WorkspaceTemplate: React.FC<WorkspaceTemplateProps> = ({
  data,
  endTemplateSession
}) => {
  const { question, subQuestions } = data;

  const [answerContent, setAnswerContent] = useState("");
  const [newSubQuestionContent, setNewSubQuestionContent] = useState("");

  const [submitAnswer] = useMutation(REPLY, {
    variables: {
      reply: {
        replyType: "SUBMIT_ANSWER",
        answer: answerContent
      },
      userId: GUEST_USER_ID
    }
  });

  const [askQuestion] = useMutation(REPLY, {
    variables: {
      reply: {
        replyType: "ASK_QUESTION",
        subQuestion: newSubQuestionContent
      },
      userId: GUEST_USER_ID
    }
  });

  return (
    <Card style={{ marginTop: "20px", padding: "20px" }}>
      <h3>Question</h3>
      <div>{question}</div>
      <div style={{ marginTop: "20px" }}>
        <h3>Answer</h3>
        <TextField
          fullWidth
          onChange={e => setAnswerContent(e.target.value)}
          value={answerContent}
          variant="outlined"
        />
        <Button
          color="primary"
          onClick={() => submitAnswer() && endTemplateSession()}
          style={{ marginTop: "5px" }}
          variant="contained"
        >
          Submit Answer
        </Button>
      </div>
      <div style={{ marginTop: "20px" }}>
        <h3>Sub-Questions</h3>
        {subQuestions.map((sq: any, i: number) => (
          <SubQuestion key={i} subQuestion={sq} />
        ))}
        {subQuestions.length === 0 && (
          <span style={{ color: "#999" }}>No sub-questions yet...</span>
        )}
        <TextField
          fullWidth
          onChange={e => setNewSubQuestionContent(e.target.value)}
          style={{ marginTop: "10px" }}
          value={newSubQuestionContent}
          variant="outlined"
        />
        <Button
          color="primary"
          onClick={() => askQuestion() && endTemplateSession()}
          style={{ marginTop: "5px" }}
          variant="contained"
        >
          Ask Question
        </Button>
      </div>
    </Card>
  );
};
