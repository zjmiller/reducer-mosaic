import React from "react";

import { WorkspaceTemplate } from "./templates/basic-decomposition/WorkspaceTemplate";

import { JudgeWorkspaceTemplate } from "./templates/factored-evaluation/JudgeWorkspaceTemplate";
import { HonestWorkspaceTemplate } from "./templates/factored-evaluation/HonestWorkspaceTemplate";
import { MaliciousWorkspaceTemplate } from "./templates/factored-evaluation/MaliciousWorkspaceTemplate";

import GeneratorComponent from "./templates/estimation/generator_template";
import FormalizationComponent from "./templates/estimation/formalization_template";
import DecomposerComponent from "./templates/estimation/estimation_decomposer_template";

export const TemplateRouter: React.FC<any> = ({
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
