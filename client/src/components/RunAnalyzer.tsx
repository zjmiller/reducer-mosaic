import { useQuery } from "@apollo/react-hooks";
import gql from "graphql-tag";
import React, { useState } from "react";

import { FEHistoryViewer } from "./history-viewers/factored-evaluation/FEHistoryViewer";
import { RunSelector } from "./RunSelector";

const GET_RUNS = gql`
  {
    runs {
      id
    }
  }
`;

export const RunAnalyzer: React.FC = () => {
  const [runId, setRunId] = useState(null);

  const { loading: areRunsLoading, data, refetch: refetchAllRuns } = useQuery(
    GET_RUNS
  );

  if (!runId && data) {
    setRunId(data.runs[0].id);
  }

  return (
    <div>
      <small>click a run's id to start analysis</small>
      {!areRunsLoading && (
        <RunSelector runId={runId} runs={data.runs} setRunId={setRunId} />
      )}
      {runId && (
        <div
          style={{
            borderTop: "1px solid #ccc",
            marginTop: "10px",
            paddingTop: "10px"
          }}
        >
          <FEHistoryViewer
            refetchAllRuns={refetchAllRuns}
            runId={
              runId || (data && data.runs && data.runs[0] && data.runs[0].id)
            }
          />
        </div>
      )}
    </div>
  );
};
