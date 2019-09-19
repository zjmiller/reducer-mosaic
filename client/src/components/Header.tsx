import { useMutation } from "@apollo/react-hooks";
import { Button } from "@material-ui/core";
import gql from "graphql-tag";
import React from "react";

const TOTAL_RESET = gql`
  mutation {
    totalReset
  }
`;

export const Header: React.FC<{}> = () => {
  const [totalReset] = useMutation(TOTAL_RESET);

  return (
    <div
      style={{
        alignItems: "center",
        display: "flex",
        height: "70px",
        justifyContent: "center",
        marginBottom: "20px"
      }}
    >
      <Button
        color="secondary"
        onClick={async () => {
          await totalReset();
          window.location.reload();
        }}
        variant="contained"
      >
        reset
      </Button>
    </div>
  );
};
