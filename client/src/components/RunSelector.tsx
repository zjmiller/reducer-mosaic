import React from "react";

export const RunSelector: React.FC<any> = ({ runId, runs, setRunId }) => {
  return (
    <div>
      {runs.map((r: { id: string }) => {
        return (
          <div
            key={r.id}
            onClick={() => setRunId(r.id)}
            style={{
              backgroundColor: r.id === runId ? "lightGray" : "",
              border: "1px solid gray",
              cursor: "pointer",
              padding: "4px"
            }}
          >
            {r.id}
          </div>
        );
      })}
    </div>
  );
};
