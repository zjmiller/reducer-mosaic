import { Checkbox, FormControlLabel } from "@material-ui/core";
import React from "react";

import { Content } from "../../Content";
import { FEHonestWorkspaceViewer } from "./FEHonestWorkspaceViewer";

export const FEJudgeWorkspaceViewer: React.FC<any> = ({
  workspace,
  availableExports,
  runState
}) => {
  const {
    question,
    answerCandidateSelected,
    assignedTo,
    shouldShowHonestFirst,
    isActive
  } = workspace;

  const honestAnswerCandidate = runState.honestWorkspaces.find(
    (hw: any) => hw.judgeParentId === workspace.parentId
  ).answerCandidate;

  const maliciousAnswerCandidate = runState.maliciousWorkspaces.find(
    (hw: any) => hw.judgeParentId === workspace.parentId
  ).answerCandidate;

  const answerCandidate1 = shouldShowHonestFirst
    ? honestAnswerCandidate
    : maliciousAnswerCandidate;

  const answerCandidate2 = shouldShowHonestFirst
    ? maliciousAnswerCandidate
    : honestAnswerCandidate;

  const honestSubQuestions = runState.honestWorkspaces.filter(
    (hw: any) => hw.judgeParentId === workspace.id
  );

  const limitedAvailableExports = availableExports.map((e: any) => ({
    exportId: e.exportId,
    // only send export content if the workspace introduced the export
    // or if a judge has unlocked the export
    content:
      workspace.unlockedExports.includes(e.exportId) ||
      workspace.containsExports.includes(e.exportId)
        ? e.content
        : undefined
  }));

  return (
    <div>
      <div
        style={{
          backgroundColor: "rgba(0,0,0, 0.1)",
          borderLeft: "3px solid #666",
          marginBottom: "10px",
          padding: "10px",
          paddingLeft: "20px",
          paddingTop: 0
        }}
      >
        <FormControlLabel
          control={
            <Checkbox
              checked={isActive}
              readOnly={true}
              onChange={() => {}}
              value="checkedB"
              color="primary"
            />
          }
          label="is active"
        />
        {assignedTo && (
          <div style={{ color: "red", fontWeight: 600, marginBottom: "8px" }}>
            {" "}
            currently assigned to user{" "}
          </div>
        )}
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
              availableExports={limitedAvailableExports}
            />
          </div>
        </div>
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
            1
          </div>
          <div style={{ flex: "1 1 auto" }}>
            <Content
              content={answerCandidate1}
              availableExports={limitedAvailableExports}
            />
          </div>
        </div>
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
            2
          </div>
          <div style={{ flex: "1 1 auto" }}>
            <Content
              content={answerCandidate2}
              availableExports={limitedAvailableExports}
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
            Selected
          </div>
          <div style={{ flex: "1 1 auto" }}>
            {answerCandidateSelected ? (
              answerCandidateSelected
            ) : (
              <em style={{ color: "#999" }}>no answer selected yet</em>
            )}
          </div>
        </div>
      </div>
      {honestSubQuestions.length > 0 && (
        <div style={{ marginLeft: "20px" }}>
          {honestSubQuestions.map((hw: any, i: number, arr: any[]) => (
            <div
              key={i}
              style={{
                marginBottom: i + 1 < arr.length ? "30px" : 0
              }}
            >
              <FEHonestWorkspaceViewer
                workspace={hw}
                availableExports={availableExports}
                runState={runState}
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
