import { Checkbox, FormControlLabel } from "@material-ui/core";
import React from "react";

import { FEMaliciousWorkspaceViewer } from "./FEMaliciousWorkspaceViewer";

import { Content } from "../../Content";

export const FEHonestWorkspaceViewer: React.FC<any> = ({
  workspace,
  availableExports,
  runState
}) => {
  const { question, answerCandidate, assignedTo, isActive } = workspace;

  const maliciousWorkspace = runState.maliciousWorkspaces.find(
    (mw: any) => mw.judgeParentId === workspace.judgeParentId
  );

  return (
    <div>
      <div
        style={{
          backgroundColor: "#e8f8e8",
          borderLeft: "3px solid #696",
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
            <Content content={question} availableExports={availableExports} />
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
            Candidate
          </div>
          <div style={{ flex: "1 1 auto" }}>
            {answerCandidate ? (
              <Content
                content={answerCandidate}
                availableExports={availableExports}
              />
            ) : (
              <em style={{ color: "#999" }}>no answer candidate yet</em>
            )}
          </div>
        </div>
      </div>
      {maliciousWorkspace && (
        <FEMaliciousWorkspaceViewer
          workspace={maliciousWorkspace}
          availableExports={availableExports}
          runState={runState}
        />
      )}
    </div>
  );
};
