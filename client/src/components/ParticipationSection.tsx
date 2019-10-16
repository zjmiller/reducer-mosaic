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
  mutation($interactionId: ID, $reply: JSON, $userEmail: String) {
    submitReply(
      interactionId: $interactionId
      reply: $reply
      userEmail: $userEmail
    )
  }
`;

export const ParticipationSection: React.FC<any> = ({ email }) => {
  const [savedData, setSavedData] = useState();

  const [findWork, { data, error }] = useMutation(FIND_WORK, {
    variables: { userEmail: email }
  });

  const [reply] = useMutation(REPLY);

  const handleReply = (variables: any) => {
    console.log(variables);
    return reply({
      variables
    });
  };

  if (data && data !== savedData) {
    console.log("data", data);
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
      {!error &&
        savedData &&
        savedData.findWorkForUser === null &&
        shouldShowTemplate && <div>No work found</div>}
      {!error &&
        savedData &&
        savedData.findWorkForUser &&
        shouldShowTemplate && (
          <TemplateRouter
            interactionId={savedData.findWorkForUser.interactionId}
            templateData={savedData.findWorkForUser.template.templateData}
            templateIdentifier={
              savedData.findWorkForUser.template.templateIdentifier
            }
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
