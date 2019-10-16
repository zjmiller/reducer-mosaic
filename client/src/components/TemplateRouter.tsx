import React from "react";

import GeneratorComponent from "./templates/estimation/generator_template";
import FormalizationComponent from "./templates/estimation/formalization_template";
import DecomposerComponent from "./templates/estimation/estimation_decomposer_template";

export const TemplateRouter: React.FC<any> = ({
  interactionId,
  templateData,
  templateIdentifier,
  endTemplateSession,
  email,
  handleReply
}) => {
  if (templateIdentifier === "generator_template") {
    return (
      <GeneratorComponent
        templateData={templateData}
        reply={(reply: any) =>
          handleReply({ interactionId, userEmail: email, reply })
        }
        endTemplateSession={endTemplateSession}
      />
    );
  }

  if (templateIdentifier === "formalization_template") {
    return (
      <FormalizationComponent
        templateData={templateData}
        reply={async (reply: any) => {
          await handleReply({ interactionId, userEmail: email, reply });
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
          await handleReply({ interactionId, userEmail: email, reply });
          endTemplateSession();
        }}
        endTemplateSession={endTemplateSession}
      />
    );
  }

  return null;
};
