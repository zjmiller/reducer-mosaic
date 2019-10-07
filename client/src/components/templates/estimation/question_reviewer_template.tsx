import * as React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import "./Estimation.css";
import { TextInputComponent } from "./TextInputComponent";
import { validateForm } from "./util";

interface QuestionReviewerData {
  readonly question: string;
}

const QuestionReviewerComponent: React.FunctionComponent<any> = props => {
  const data = (props.templateData as unknown) as QuestionReviewerData; // TODO
  const [question, setQuestion] = React.useState(data.question);
  const [formValidated, setFormValidated] = React.useState(false);

  return (
    <div className="reviewer container">
      <div className="banner">
        <h3 className="bannerText">Factored Cognition Question Review</h3>
      </div>

      <div className="questionPane cell">
        <div>
          Review the following question. If it makes sense, submit it without
          modification. If it does not make sense, either modify it or choose to
          mark it as invalid.
        </div>
      </div>
      <div className="actionPane cell">
        <Form
          onSubmit={(e: React.FormEvent) => {
            if (validateForm(e, e.target, setFormValidated)) {
              props.reply(({
                question,
                type: "ReviewedQuestion"
              } as unknown) as any);
            }
          }}
          validated={formValidated}
        >
          <TextInputComponent
            label={"Question"}
            inputText={question}
            onChange={(evt: any) => {
              setQuestion(evt.target.value);
            }}
            required={true}
          />
          <Button type="submit">Submit</Button>
          <Button
            onClick={
              () => props.reply(({ type: "InvalidQuestion" } as unknown) as any) // TODO
            }
          >
            Mark as Invalid
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default QuestionReviewerComponent;
