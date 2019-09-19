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
  findWork(): void;
}

const SubQuestion: React.FC<any> = ({
  subQuestion,
  availableExports,
  unlockExport
}) => {
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
        <div style={{ flex: "1 1 auto" }}>
          <Content
            content={question}
            availableExports={availableExports}
            unlockExport={unlockExport}
          />
        </div>
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
          {answer ? (
            <Content
              content={answer}
              availableExports={availableExports}
              unlockExport={unlockExport}
            />
          ) : (
            <em style={{ color: "#999" }}>no answer yet</em>
          )}
        </div>
      </div>
    </div>
  );
};

export const JudgeWorkspaceTemplate: React.FC<WorkspaceTemplateProps> = ({
  data,
  endTemplateSession,
  findWork
}) => {
  const {
    question,
    answerCandidate1,
    answerCandidate2,
    subQuestions,
    availableExports
  } = data;

  const [newSubQuestionContent, setNewSubQuestionContent] = useState("");

  const [selectAnswerCandidate] = useMutation(REPLY);

  const [unlockExportBase] = useMutation(REPLY);

  const selectAnswerCandidate1 = () =>
    selectAnswerCandidate({
      variables: {
        reply: {
          replyType: "SELECT_ANSWER_CANDIDATE",
          answerCandidateSelected: 1
        },
        userId: GUEST_USER_ID
      }
    });

  const selectAnswerCandidate2 = () =>
    selectAnswerCandidate({
      variables: {
        reply: {
          replyType: "SELECT_ANSWER_CANDIDATE",
          answerCandidateSelected: 2
        },
        userId: GUEST_USER_ID
      }
    });

  const unlockExport = async (exportId: string) => {
    await unlockExportBase({
      variables: {
        reply: {
          replyType: "UNLOCK_EXPORT",
          exportId
        },
        userId: GUEST_USER_ID
      }
    });
    findWork();
  };

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
      <h3 style={{ color: "#777", marginBottom: "15px" }}>Judge Workspace</h3>
      <h3>Question</h3>
      <Content
        content={question}
        availableExports={availableExports}
        unlockExport={unlockExport}
      />
      {answerCandidate1 && (
        <div style={{ border: "1px solid #444", marginTop: "15px" }}>
          <div
            style={{
              backgroundColor: "#444",
              color: "#fff",
              padding: "5px"
            }}
          >
            Answer A1
          </div>
          <div style={{ padding: "10px" }}>
            <Content
              content={answerCandidate1}
              availableExports={availableExports}
              unlockExport={unlockExport}
            />
            <div style={{ marginTop: "10px" }}>
              <Button
                color="primary"
                onClick={() => selectAnswerCandidate1() && endTemplateSession()}
                variant="outlined"
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      )}
      {answerCandidate2 && (
        <div style={{ border: "1px solid #444", marginTop: "15px" }}>
          <div
            style={{
              backgroundColor: "#444",
              color: "#fff",
              padding: "5px"
            }}
          >
            Answer A2
          </div>
          <div style={{ padding: "10px" }}>
            <Content
              content={answerCandidate2}
              availableExports={availableExports}
              unlockExport={unlockExport}
            />
            <div style={{ marginTop: "10px" }}>
              <Button
                color="primary"
                onClick={() => selectAnswerCandidate2() && endTemplateSession()}
                variant="outlined"
              >
                Select
              </Button>
            </div>
          </div>
        </div>
      )}

      <div style={{ marginTop: "20px" }}>
        <h3>Sub-Questions</h3>
        {subQuestions.map((sq: any, i: number) => (
          <SubQuestion
            key={i}
            subQuestion={sq}
            availableExports={availableExports}
            unlockExport={unlockExport}
          />
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
          Ask
        </Button>
      </div>
    </Card>
  );
};
