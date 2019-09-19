import { useQuery, useMutation } from "@apollo/react-hooks";
import Button from "@material-ui/core/Button";
import gql from "graphql-tag";
import React, { useState } from "react";

import { BasicDecompWorkspaceViewer } from "./BasicDecompWorkspaceViewer";

interface BasicDecompHistoryViewerProps {
  data: any;
  historyIndex: number;
  runId: string | null;
}

const GET_RUN = gql`
  query($id: ID, $index: Int) {
    run(id: $id) {
      id
      history
      pastState(index: $index)
      state
    }
  }
`;

const COPY_RUN = gql`
  mutation($runId: ID, $index: Int) {
    createCopyOfRun(runId: $runId, index: $index)
  }
`;

const BasicDecompHistoryViewerContainer: React.FC<{
  runId: string | null;
  refetchAllRuns: () => void;
}> = ({ runId, refetchAllRuns }) => {
  const [historyIndex, setHistoryIndex] = useState(0);
  const { data, error } = useQuery(GET_RUN, {
    pollInterval: 1000,
    variables: { id: runId, index: historyIndex }
  });
  const [copyRun] = useMutation(COPY_RUN, {
    variables: { runId: runId, index: historyIndex }
  });

  if (data && historyIndex > data.run.history.actions.length) {
    setHistoryIndex(data.run.history.actions.length);
  }

  return (
    <div>
      <div>
        <Button
          disabled={historyIndex < 1}
          onClick={() => setHistoryIndex(historyIndex - 1)}
          variant="contained"
        >
          back
        </Button>
        <span
          style={{
            color: error && "red",
            display: "inline-block",
            margin: "0 20px"
          }}
        >
          {historyIndex}
          {error && " out of range"}
        </span>
        <Button
          disabled={data && historyIndex === data.run.history.actions.length}
          onClick={() => setHistoryIndex(historyIndex + 1)}
          variant="contained"
        >
          forward
        </Button>
        <Button
          onClick={async () => {
            await copyRun();
            refetchAllRuns();
          }}
          style={{
            marginLeft: "20px"
          }}
          variant="contained"
        >
          copy here
        </Button>
        {!error && (
          <div style={{ marginTop: "20px" }}>
            <BasicDecompHistoryViewerPresentational
              data={data}
              historyIndex={historyIndex}
              runId={runId}
            />
          </div>
        )}
      </div>
    </div>
  );
};

const BasicDecompHistoryViewerPresentational: React.FC<
  BasicDecompHistoryViewerProps
> = ({ data, historyIndex }) => {
  if (!data) {
    return <div>Loading</div>;
  }

  const workspaces = data.run.pastState.workspaces;
  const rootWorkspace = workspaces.find(
    (w: { parentId: string }) => w.parentId === null
  );

  return (
    <div>
      {historyIndex > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <strong>action</strong>
          <pre
            style={{
              backgroundColor: "#def",
              overflow: "scroll",
              padding: "10px"
            }}
          >
            {JSON.stringify(
              data.run.history.actions[historyIndex - 1],
              undefined,
              2
            )}
          </pre>
        </div>
      )}
      <strong>run state</strong>
      <BasicDecompWorkspaceViewer
        workspace={rootWorkspace}
        workspaces={workspaces}
      />
    </div>
  );
};

export const BasicDecompHistoryViewer = BasicDecompHistoryViewerContainer;
