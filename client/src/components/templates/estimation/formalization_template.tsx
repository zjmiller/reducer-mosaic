import * as React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import { CommentsInputComponent } from "./CommentsInput";
import "./Estimation.css";
import {
  FormalQuestion,
  FormalQuestionInputComponent
} from "./FormalQuestionInput";
import { TextComponent } from "./TextComponent";
import { validateForm } from "./util";

type FormalizationResponse =
  | { replyType: "FormalQuestion"; question: FormalQuestion; comments: string }
  | { replyType: "InvalidQuestion"; comments: string };

interface FormalizationData {
  readonly naturalQuestion: string;
  readonly response?: FormalizationResponse;
  readonly propertyOptions: string[];
}

const FormalizationComponent: React.FunctionComponent<any> = props => {
  const data = (props.templateData as unknown) as FormalizationData; // TODO

  const [question, setQuestion] = React.useState(
    data.response != null && data.response.replyType === "FormalQuestion"
      ? data.response.question
      : { entity: "" }
  );
  const [formValidated, setFormValidated] = React.useState(false);
  const [comments, setComments] = React.useState("");
  const isReview = "response" in data;

  return (
    <div className={isReview ? "reviewer container" : "formalizer container"}>
      <div className="banner">
        <h3 className="bannerText">
          Estimation Formalization {isReview ? "Review" : null}
        </h3>
      </div>
      <div className="instructionPane cell">
        <a
          href="https://docs.google.com/document/d/1L0T_xJkx84IuALxFiKaOsOlZvauD9NK5njijIOo0iE0/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instructions for Formalizing Questions
        </a>
      </div>
      <div className="questionPane cell">
        <div>Formalize the following question</div>
        <h5>
          <TextComponent text={data.naturalQuestion} />
        </h5>
      </div>
      <div className="actionPane cell">
        <Form
          onSubmit={(e: React.FormEvent) => {
            if (validateForm(e, e.target, setFormValidated)) {
              props.reply(({
                question,
                replyType: "FormalQuestion",
                comments
              } as unknown) as any);
            }
          }}
          validated={formValidated}
        >
          <FormalQuestionInputComponent
            label="Question"
            FormalQuestion={question}
            propertyOptions={data.propertyOptions}
            onChange={(newValue: FormalQuestion) => {
              setQuestion(newValue);
            }}
            required={true}
          />
          <CommentsInputComponent
            onChange={setComments}
            comments={comments}
            originalComments={
              data.response != null ? data.response.comments : undefined
            }
          />
          <Button type="submit">Submit</Button>
          <Button
            onClick={
              () =>
                props.reply(({
                  replyType: "InvalidQuestion",
                  comments
                } as unknown) as any) // TODO
            }
          >
            Question is Invalid
          </Button>
        </Form>
      </div>
    </div>
  );
};

export default FormalizationComponent;
