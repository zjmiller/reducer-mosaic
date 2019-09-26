import { useMutation } from "@apollo/react-hooks";
import { Button } from "@material-ui/core";
import gql from "graphql-tag";
import React, { useState } from "react";

import { WorkspaceTemplate } from "./templates/basic-decompositiono/WorkspaceTemplate";

import { JudgeWorkspaceTemplate } from "./templates/factored-evaluation/JudgeWorkspaceTemplate";
import { HonestWorkspaceTemplate } from "./templates/factored-evaluation/HonestWorkspaceTemplate";
import { MaliciousWorkspaceTemplate } from "./templates/factored-evaluation/MaliciousWorkspaceTemplate";

const FIND_WORK = gql`
  mutation($userEmail: String) {
    findWorkForUser(userEmail: $userEmail)
  }
`;

const Template: React.FC<any> = ({
  templateData,
  templateIdentifier,
  endTemplateSession,
  findWork,
  email
}) => {
  if (templateIdentifier === "WORKSPACE_TEMPLATE") {
    return (
      <WorkspaceTemplate
        data={templateData}
        endTemplateSession={endTemplateSession}
      />
    );
  }

  if (templateIdentifier === "JUDGE_WORKSPACE_TEMPLATE") {
    return (
      <JudgeWorkspaceTemplate
        data={templateData}
        email={email}
        endTemplateSession={endTemplateSession}
        findWork={findWork}
      />
    );
  }

  if (templateIdentifier === "HONEST_WORKSPACE_TEMPLATE") {
    return (
      <HonestWorkspaceTemplate
        data={templateData}
        email={email}
        endTemplateSession={endTemplateSession}
      />
    );
  }

  if (templateIdentifier === "MALICIOUS_WORKSPACE_TEMPLATE") {
    return (
      <MaliciousWorkspaceTemplate
        data={templateData}
        email={email}
        endTemplateSession={endTemplateSession}
      />
    );
  }

  return null;
};

export const ParticipationSection: React.FC<any> = ({ email }) => {
  const [savedData, setSavedData] = useState();

  const [findWork, { data, error }] = useMutation(FIND_WORK, {
    variables: { userEmail: email }
  });

  if (data && data !== savedData) {
    setSavedData(data);
  }

  const [shouldShowTemplate, setShouldShowTemplate] = useState(false);

  return (
    <div>
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
      {!error && savedData && shouldShowTemplate && (
        <Template
          templateData={savedData.findWorkForUser.templateData}
          templateIdentifier={savedData.findWorkForUser.templateIdentifier}
          endTemplateSession={() => setShouldShowTemplate(false)}
          findWork={findWork}
          email={email}
        />
      )}
      {error && (
        <div style={{ color: "red", marginTop: "10px" }}>{error.message}</div>
      )}
    </div>
  );
};
