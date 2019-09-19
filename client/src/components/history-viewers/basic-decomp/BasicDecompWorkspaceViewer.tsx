import { Checkbox, FormControlLabel } from "@material-ui/core";
import React from "react";

export const BasicDecompWorkspaceViewer: React.FC<any> = ({
  workspace,
  workspaces
}) => {
  const { question, answer, assignedTo, isActive } = workspace;

  const childWorkspaces = workspaces.filter(
    (w: { parentId: string }) => w.parentId === workspace.id
  );

  return (
    <div>
      <div
        style={{
          backgroundColor: "rgba(0,0,0, 0.1)",
          borderLeft: "3px solid gray",
          marginBottom: "10px",
          padding: "10px",
          paddingLeft: "20px"
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
        {childWorkspaces.length > 0 && (
          <div
            style={{
              marginLeft: "10px",
              marginTop: "10px"
            }}
          >
            {childWorkspaces.map((cw: { id: string }) => (
              <BasicDecompWorkspaceViewer
                key={cw.id}
                workspace={cw}
                workspaces={workspaces}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
