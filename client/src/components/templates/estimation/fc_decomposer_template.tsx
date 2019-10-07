import * as React from "react";
import Accordion from "react-bootstrap/Accordion";
import Button from "react-bootstrap/Button";
import Card from "react-bootstrap/Card";
import Form from "react-bootstrap/Form";
import "./Estimation.css";
import { TextComponent } from "./TextComponent";
import { TextInputComponent } from "./TextInputComponent";
import { validateForm } from "./util";

type FCDecomposerResponse =
  | { type: "Answer"; answer: string }
  | { type: "Decompose"; subquestions: [string, string]; aggregation: string };

interface FCDecomposerData {
  readonly question: string;
  readonly depth: number;
  readonly response?: FCDecomposerResponse;
}

const FCDecomposerComponent: React.FunctionComponent<any> = props => {
  const data = (props.templateData as unknown) as FCDecomposerData; // TODO
  const isReview = "response" in data;
  let subquestions_ = ["", ""];
  let answer_ = "";
  let aggregation_ = "";
  let defaultActiveKey = "0";
  if (data.response != null) {
    switch (data.response.type) {
      case "Decompose":
        defaultActiveKey = "1";
        subquestions_ = data.response.subquestions;
        aggregation_ = data.response.aggregation;
        break;
      case "Answer":
        defaultActiveKey = "0";
        answer_ = data.response.answer;
        break;
    }
  }

  const [subquestions, setSubquestions] = React.useState(subquestions_);
  const [answer, setAnswer] = React.useState(answer_);
  const [aggregation, setAggregation] = React.useState(aggregation_);

  const [answerFormValidated, setAnswerFormValidated] = React.useState(false);
  const [
    decompositionFormValidated,
    setDecompositionFormValidated
  ] = React.useState(false);

  return (
    <div
      className={isReview ? "reviewer fcContainer" : "FCdecomposer fcContainer"}
    >
      <div className="banner">
        <h3 className="bannerText">
          {isReview
            ? "Factored Cognition FCDecomposer Review"
            : "Factored Cognition FCDecomposer"}
        </h3>
      </div>

      <div className="topLevelQuestionPane cell">
        <div>
          <h5>
            <TextComponent text={"Question: " + data.question} />
          </h5>
        </div>
      </div>
      <div className="subQuestionsPane cell">
        {isReview ? (
          <div>
            Review the following decomposition action, change it if it does not
            make sense, then submit as you normally would
          </div>
        ) : (
          false
        )}
        <Accordion defaultActiveKey={defaultActiveKey}>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="0">
                Answer
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="0">
              <Card.Body>
                <Form
                  onSubmit={(e: React.FormEvent) => {
                    if (validateForm(e, e.target, setAnswerFormValidated)) {
                      props.reply(({
                        answer,
                        type: "Answer"
                      } as unknown) as any);
                    }
                  }}
                  validated={answerFormValidated}
                >
                  <TextInputComponent
                    label="Answer"
                    key="0"
                    inputText={answer}
                    onChange={(evt: any) => {
                      setAnswer(evt.target.value);
                    }}
                    required={true}
                  />
                  <Button type="submit">Submit</Button>
                </Form>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
          <Card>
            <Card.Header>
              <Accordion.Toggle as={Button} variant="link" eventKey="1">
                Decompose
              </Accordion.Toggle>
            </Card.Header>
            <Accordion.Collapse eventKey="1">
              <Card.Body>
                <div>Depth Remaining {data.depth}</div>
                <Form
                  onSubmit={(e: React.FormEvent) => {
                    if (
                      validateForm(e, e.target, setDecompositionFormValidated)
                    ) {
                      props.reply(({
                        subquestions,
                        aggregation,
                        type: "Decompose"
                      } as unknown) as any);
                    }
                  }}
                  validated={decompositionFormValidated}
                >
                  {subquestions.map((q, i) => {
                    return (
                      <TextInputComponent
                        label={"Subquestion " + (i + 1).toString()}
                        key={i}
                        inputText={q}
                        onChange={(evt: any) => {
                          const copy = subquestions.slice(0);
                          copy[i] = evt.target.value;
                          setSubquestions(copy);
                        }}
                        required={true}
                      />
                    );
                  })}
                  <TextInputComponent
                    label={"Aggregation"}
                    inputText={aggregation}
                    onChange={(evt: any) => {
                      setAggregation(evt.target.value);
                    }}
                    required={true}
                  />
                  <Button type="submit">Submit</Button>
                </Form>
              </Card.Body>
            </Accordion.Collapse>
          </Card>
        </Accordion>
      </div>
      {}
    </div>
  );
};

export default FCDecomposerComponent;
