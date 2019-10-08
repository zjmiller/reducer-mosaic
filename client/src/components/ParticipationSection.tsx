import { useMutation } from "@apollo/react-hooks";
import { Button } from "@material-ui/core";
import gql from "graphql-tag";
import React, { useState } from "react";

import { TemplateRouter } from "./TemplateRouter";

const FIND_WORK = gql`
  mutation($userEmail: String) {
    findWorkForUser(userEmail: $userEmail)
  }
`;

const REPLY = gql`
  mutation($reply: JSON, $userEmail: String) {
    submitReply(reply: $reply, userEmail: $userEmail)
  }
`;

export const ParticipationSection: React.FC<any> = ({ email }) => {
  const [savedData, setSavedData] = useState();

  const [findWork, { data, error }] = useMutation(FIND_WORK, {
    variables: { userEmail: email }
  });

  const [reply] = useMutation(REPLY);

  const handleReply = (variables: any) =>
    reply({
      variables
    });

  if (data && data !== savedData) {
    setSavedData(data);
  }

  const [shouldShowTemplate, setShouldShowTemplate] = useState(false);

  return (
    <div>
      <div style={{ marginBottom: "50px", textAlign: "center" }}>
        <Button
          color="primary"
          onClick={async () => {
            await findWork();
            setShouldShowTemplate(true);
          }}
          variant="contained"
        >
          find work
        </Button>
      </div>

      {!error && savedData && shouldShowTemplate && (
        <TemplateRouter
          templateData={savedData.findWorkForUser.templateData}
          templateIdentifier={savedData.findWorkForUser.templateIdentifier}
          endTemplateSession={() => setShouldShowTemplate(false)}
          findWork={findWork}
          email={email}
          handleReply={handleReply}
        />
      )}
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>{error.message}</div>
      )}
    </div>
  );
};
