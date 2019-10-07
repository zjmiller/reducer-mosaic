import * as React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./Estimation.css";
import {
  FormalQuestion,
  FormalQuestionInputComponent
} from "./FormalQuestionInput";
import { validateForm } from "./util";

const TestTemplateComponent: React.FunctionComponent<any> = props => {
  // const data = (props.templateData as unknown) as GeneratorData; // TODO
  const [question, setQuestion] = React.useState({});
  const [formValidated, setFormValidated] = React.useState(false);

  return (
    <div className="decomposer container">
      <div className="banner">
        <h3 className="bannerText">Test FormalQuestionInput</h3>
      </div>

      <div className="actionPane cell">
        {
          <Form
            onSubmit={(e: React.FormEvent) => {
              if (validateForm(e, e.target, setFormValidated)) {
                props.reply(({
                  question,
                  type: "Reply"
                } as unknown) as any);
              }
            }}
            validated={formValidated}
          >
            <FormalQuestionInputComponent
              label="Test"
              FormalQuestion={question}
              propertyOptions={["color", "shape", "charge"]}
              onChange={(newValue: FormalQuestion) => {
                setQuestion(newValue);
              }}
              required={true}
            />
            <Button type="submit">Submit</Button>
          </Form>
        }
      </div>
    </div>
  );
};

export default TestTemplateComponent;
