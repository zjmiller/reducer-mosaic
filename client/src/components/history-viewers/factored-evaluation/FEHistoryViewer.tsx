import { useQuery, useMutation } from "@apollo/react-hooks";
import Button from "@material-ui/core/Button";
import gql from "graphql-tag";
import React, { useState } from "react";

import { FEHonestWorkspaceViewer } from "./FEHonestWorkspaceViewer";

import { GUEST_USER_ID } from "../../../config";

interface FEHistoryViewerProps {
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

const ADMIN_ACTION = gql`
  mutation($runId: ID, $action: JSON) {
    adminAction(runId: $runId, action: $action)
  }
`;

const FEHistoryViewerContainer: React.FC<{
  runId: string | null;
  refetchAllRuns: () => void;
}> = ({ runId, refetchAllRuns }) => {
  const [hasManuallySetHistoryIndex, setHasManuallySetHistoryIndex] = useState(
    false
  );

  const [historyIndex, setHistoryIndex] = useState(0);

  const { data, error } = useQuery(GET_RUN, {
    pollInterval: 1000,
    variables: { id: runId, index: historyIndex }
  });

  if (
    data &&
    !hasManuallySetHistoryIndex &&
    data.run.history.actions.length !== historyIndex
  ) {
    setHistoryIndex(data.run.history.actions.length);
  }

  const [copyRun] = useMutation(COPY_RUN, {
    variables: { runId: runId, index: historyIndex }
  });

  if (data && historyIndex > data.run.history.actions.length) {
    setHistoryIndex(data.run.history.actions.length);
  }

  const [unAssignAll] = useMutation(ADMIN_ACTION, {
    variables: {
      runId: runId,
      action: { actionType: "_ADMIN_UN_ASSIGN_ALL", userId: GUEST_USER_ID }
    }
  });

  return (
    <div>
      <div>
        <Button
          disabled={historyIndex < 1}
          onClick={() => {
            setHistoryIndex(historyIndex - 1);
            setHasManuallySetHistoryIndex(true);
          }}
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
          onClick={() => {
            setHistoryIndex(historyIndex + 1);
            setHasManuallySetHistoryIndex(true);
          }}
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
        <div style={{ marginTop: "15px" }}>
          <div style={{ fontWeight: 600, marginBottom: "5px" }}>
            demo admin action{" "}
            <small
              style={{
                display: "block",
                fontWeight: 400
              }}
            >
              to see result, make sure you're viewing latest state of history
            </small>
          </div>
          <Button onClick={() => unAssignAll()} variant="contained">
            un-assign everyone in this run
          </Button>
        </div>
        {!error && (
          <div style={{ marginTop: "20px" }}>
            <FEHistoryViewerPresentational
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

const FEHistoryViewerPresentational: React.FC<FEHistoryViewerProps> = ({
  data,
  historyIndex
}) => {
  if (!data) {
    return <div>Loading</div>;
  }

  const honestWorkspaces = data.run.pastState.honestWorkspaces;
  const rootHonestWorkspace = honestWorkspaces.find(
    (w: { judgeParentId: string | null }) => w.judgeParentId === null
  );

  const availableExports = data.run.pastState.availableExports;

  return (
    <div style={{ marginBottom: "20px" }}>
      {historyIndex > 0 && (
        <div style={{ marginBottom: "10px" }}>
          <strong>action</strong>
          <pre
            style={{
              backgroundColor: "#def",
              overflow: "scroll",
              padding: "3px"
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
      <FEHonestWorkspaceViewer
        workspace={rootHonestWorkspace}
        availableExports={availableExports}
        runState={data.run.pastState}
      />
    </div>
  );
};

export const FEHistoryViewer = FEHistoryViewerContainer;
