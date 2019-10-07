import { useMutation } from "@apollo/react-hooks";
import { Button } from "@material-ui/core";
import gql from "graphql-tag";
import React, { useState } from "react";

import { WorkspaceTemplate } from "./templates/basic-decomposition/WorkspaceTemplate";

import { JudgeWorkspaceTemplate } from "./templates/factored-evaluation/JudgeWorkspaceTemplate";
import { HonestWorkspaceTemplate } from "./templates/factored-evaluation/HonestWorkspaceTemplate";
import { MaliciousWorkspaceTemplate } from "./templates/factored-evaluation/MaliciousWorkspaceTemplate";

import GeneratorComponent from "./templates/estimation/generator_template";
import FormalizationComponent from "./templates/estimation/formalization_template";
import DecomposerComponent from "./templates/estimation/estimation_decomposer_template";

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

const Template: React.FC<any> = ({
  templateData,
  templateIdentifier,
  endTemplateSession,
  findWork,
  email,
  handleReply
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

  if (templateIdentifier === "generator_template") {
    return (
      <GeneratorComponent
        templateData={templateData}
        reply={(reply: any) => handleReply({ userEmail: email, reply })}
        endTemplateSession={endTemplateSession}
      />
    );
  }

  if (templateIdentifier === "formalization_template") {
    return (
      <FormalizationComponent
        templateData={templateData}
        reply={async (reply: any) => {
          await handleReply({ userEmail: email, reply });
          endTemplateSession();
        }}
        endTemplateSession={endTemplateSession}
      />
    );
  }

  if (templateIdentifier === "decomposition_template") {
    return (
      <DecomposerComponent
        templateData={templateData}
        reply={async (reply: any) => {
          await handleReply({ userEmail: email, reply });
          endTemplateSession();
        }}
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
        <Template
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
