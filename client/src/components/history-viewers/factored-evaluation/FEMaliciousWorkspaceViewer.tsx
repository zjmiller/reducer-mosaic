import { Checkbox, FormControlLabel } from "@material-ui/core";
import React from "react";

import { FEJudgeWorkspaceViewer } from "./FEJudgeWorkspaceViewer";

import { Content } from "../../Content";

export const FEMaliciousWorkspaceViewer: React.FC<any> = ({
  workspace,
  availableExports,
  runState
}) => {
  const {
    answerCandidate,
    didDeclineToChallenge,
    assignedTo,
    isActive
  } = workspace;

  const judgeWorkspace = runState.judgeWorkspaces.find(
    (jw: any) => jw.parentId === workspace.judgeParentId
  );

  return (
    <div>
      <div
        style={{
          backgroundColor: "#f8e8e8",
          borderLeft: "3px solid #966",
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
            Candidate
          </div>
          <div style={{ flex: "1 1 auto" }}>
            {didDeclineToChallenge && (
              <em style={{ color: "red" }}>declined to challenge</em>
            )}
            {answerCandidate ? (
              <Content
                content={answerCandidate}
                availableExports={availableExports}
              />
            ) : (
              !didDeclineToChallenge && (
                <em style={{ color: "#999" }}>no answer candidate yet</em>
              )
            )}
          </div>
        </div>
      </div>
      {judgeWorkspace && (
        <FEJudgeWorkspaceViewer
          workspace={judgeWorkspace}
          availableExports={availableExports}
          runState={runState}
        />
      )}
    </div>
  );
};
