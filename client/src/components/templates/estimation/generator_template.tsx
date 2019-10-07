import * as React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./Estimation.css";
import { TextComponent } from "./TextComponent";
import { TextInputComponent } from "./TextInputComponent";
import { validateForm } from "./util";

interface GeneratorData {
  readonly prompt: string;
  readonly questionsPerPrompt: number;
}

const GeneratorComponent: React.FunctionComponent<any> = props => {
  const data = (props.templateData as unknown) as GeneratorData; // TODO
  const [questions, setQuestions] = React.useState(
    Array(data.questionsPerPrompt).fill("")
  );
  const [formValidated, setFormValidated] = React.useState(false);

  return (
    <div className="generator container">
      <div className="banner">
        <h3 className="bannerText">Factored Cognition Generator</h3>
      </div>
      <div className="instructionPane cell">
        <a
          href="https://docs.google.com/document/d/1n9bT4iD6GvHqgCxifeL9Q_XfaAOU67f_-pEfiC7dxHY/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instructions for Generating Questions
        </a>
      </div>
      <div className="questionPane cell">
        <div>
          <TextComponent text={data.prompt} />
        </div>
      </div>
      <div className="actionPane cell">
        {
          <Form
            onSubmit={async (e: React.FormEvent) => {
              if (validateForm(e, e.target, setFormValidated)) {
                await props.reply({
                  questions,
                  replyType: "InitialQuestions"
                });
                props.endTemplateSession();
              }
            }}
            validated={formValidated}
          >
            {questions.map((q, i) => {
              return (
                <TextInputComponent
                  required={true}
                  label={`Question${i + 1}`}
                  key={i}
                  inputText={q}
                  onChange={(evt: any) => {
                    const copy = [...questions];
                    copy[i] = evt.target.value;
                    setQuestions(copy);
                  }}
                />
              );
            })}
            <Button type="submit">Submit</Button>
          </Form>
        }
      </div>
    </div>
  );
};

export default GeneratorComponent;
