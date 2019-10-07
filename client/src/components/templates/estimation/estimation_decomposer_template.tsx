import * as React from "react";
import Button from "react-bootstrap/Button";
import Form from "react-bootstrap/Form";
import InputGroup from "react-bootstrap/InputGroup";
import Tab from "react-bootstrap/Tab";
import Tabs from "react-bootstrap/Tabs";
import { AutoCompleteComponent } from "./AutoCompleteComponent";
import { CommentsInputComponent } from "./CommentsInput";
import "./Estimation.css";
import {
  FormalQuestion,
  FormalQuestionInputComponent
} from "./FormalQuestionInput";
import { TextComponent } from "./TextComponent";
import { validateForm } from "./util";

const aggregationOptions: string[][] = [
  [],
  [
    "A1",
    "volume of a sphere with radius A1",
    "surface area of a sphere with radius A1",
    "volume of a sphere with diameter A1",
    "surface area of a sphere with diameter A1",
    "area of a circle with diameter A1",
    "circumference of a circle with diameter A1",
    "area of a circle with radius A1",
    "circumference of a circle with radius A1"
  ],
  ["A1 / A2", "A1 * A2", "A1 + A2", "A1 - A2"],
  ["A1 * A2 * A3"]
];

type DecomposerResponse =
  | {
      type: "Decomposition";
      subquestions: FormalQuestion[];
      aggregation: string;
      comments: string;
    }
  | { type: "Answer"; comments: string }
  | { type: "InvalidQuestion"; comments: string };

interface DecomposerData {
  readonly question: FormalQuestion;
  readonly depth: number;
  readonly response?: DecomposerResponse;
  readonly propertyOptions: string[];
}

interface FormComponentData {
  readonly templateData: DecomposerData;
  readonly reply: (response: any) => any;
}

const DecompositionFormComponent: React.FunctionComponent<
  FormComponentData
> = props => {
  const data = (props.templateData as unknown) as DecomposerData; // TODO
  let subquestionsInit: FormalQuestion[] = [{}, {}];
  let aggregationInit = "";
  let originalComments: string | undefined;
  if (data.response != null && data.response.type === "Decomposition") {
    subquestionsInit = data.response.subquestions;
    aggregationInit = data.response.aggregation;
    originalComments = data.response.comments;
  }

  const [subquestions, setSubquestions] = React.useState(subquestionsInit);
  const [aggregation, setAggregation] = React.useState(aggregationInit);
  const [formValidated, setFormValidated] = React.useState(false);
  const [comments, setComments] = React.useState("");
  // const [subquestionsLength, setsubquestionsLength] = React.useState(subquestions.length);

  return (
    <Form
      onSubmit={(e: React.FormEvent) => {
        if (validateForm(e, e.target, setFormValidated)) {
          props.reply(({
            replyType: "Decomposition",
            subquestions,
            aggregation,
            comments
          } as unknown) as any);
        }
      }}
      validated={formValidated}
    >
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>Format</InputGroup.Text>
        </InputGroup.Prepend>

        <Form.Control
          as="select"
          value={subquestions.length.toString()}
          onChange={(evt: any) => {
            const len = parseInt(evt.target.value, 10);
            if (subquestions.length === 3 && len !== 3) {
              setAggregation("");
            }
            if (len === 3 && subquestions.length !== 3) {
              setSubquestions([
                { property: "length", entity: data.question.entity },
                { property: "width", entity: data.question.entity },
                { property: "height", entity: data.question.entity }
              ]);
              setAggregation("A1 * A2 * A3");
            } else if (len < subquestions.length) {
              setSubquestions(subquestions.slice(0, len));
            } else if (len > subquestions.length) {
              const newSubquestions = [...subquestions];
              while (len > newSubquestions.length) {
                newSubquestions.push({});
              }
              setSubquestions(newSubquestions);
            }
          }}
        >
          <option label="1 Subquestion">1</option>
          <option label="2 Subquestions">2</option>
          <option label="3 Subquestions (only for volume=length*width*height)">
            3
          </option>
        </Form.Control>
      </InputGroup>

      {subquestions.map((q, i) => {
        return (
          <FormalQuestionInputComponent
            label={"A" + (i + 1).toString()}
            FormalQuestion={q}
            propertyOptions={data.propertyOptions}
            onChange={(newValue: FormalQuestion) => {
              const copy = subquestions.slice(0);
              copy[i] = newValue;
              setSubquestions(copy);
            }}
            required={true}
          />
        );
      })}
      <InputGroup>
        <InputGroup.Prepend>
          <InputGroup.Text>Aggregation</InputGroup.Text>
        </InputGroup.Prepend>
        <AutoCompleteComponent
          value={aggregation}
          onChange={(value: string) => setAggregation(value)}
          required={true}
          options={aggregationOptions[subquestions.length]}
        />
      </InputGroup>

      {
        // <TextInputComponent
        //   label={"Aggregation"}
        //   inputText={aggregation}
        //   onChange={(evt: any) => { setAggregation(evt.target.value) }}
        //   required={true}
        // />
      }
      <CommentsInputComponent
        onChange={setComments}
        comments={comments}
        originalComments={originalComments}
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
};

// const ApproximationFormComponent: React.FunctionComponent<FormComponentData> = props => {
//   const data = (props.templateData as unknown) as DecomposerData; // TODO
//   let subquestionsInit: FormalQuestion[] = [{}];
//   let originalComments: string | undefined;
//   if (data.response != null && data.response.type === 'Approximation') {
//     subquestionsInit = data.response.subquestions;
//     originalComments = data.response.comments;
//   }

//   const [subquestions, setSubquestions] = React.useState(subquestionsInit);
//   const [formValidated, setFormValidated] = React.useState(false);
//   const [comments, setComments] = React.useState("");

//   return (
//     <Form
//       onSubmit={(e: React.FormEvent) => {
//         if (validateForm(e, e.target, setFormValidated)) {
//           props.reply(({ type: 'Approximation', subquestions, aggregation: "A1", comments } as unknown) as AnyJson)
//         }
//       }}
//       validated={formValidated}
//     >
//       <FormalQuestionInputComponent
//         label="Approximation"
//         FormalQuestion={subquestions[0]}
//         propertyOptions={data.propertyOptions}
//         onChange={(newValue: FormalQuestion) => {
//           setSubquestions([newValue]);
//         }}
//         required={true}
//       />
//       <CommentsInputComponent
//         onChange={setComments}
//         comments={comments}
//         originalComments={originalComments}
//       />
//       <Button type="submit">Submit</Button>
//     </Form>)

// }

const AnswerFormComponent: React.FunctionComponent<
  FormComponentData
> = props => {
  const data = (props.templateData as unknown) as DecomposerData; // TODO
  const [comments, setComments] = React.useState("");
  let originalComments: string | undefined;
  if (data.response != null && data.response.type === "Answer") {
    originalComments = data.response.comments;
  }

  return (
    <Form
      onSubmit={(e: React.FormEvent) => {
        props.reply(({ replyType: "Answer", comments } as unknown) as any);
      }}
    >
      <CommentsInputComponent
        onChange={setComments}
        comments={comments}
        originalComments={originalComments}
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
};

const InvalidQuestionFormComponent: React.FunctionComponent<
  FormComponentData
> = props => {
  const data = (props.templateData as unknown) as DecomposerData; // TODO
  const [comments, setComments] = React.useState("");
  let originalComments: string | undefined;
  if (data.response != null && data.response.type === "InvalidQuestion") {
    originalComments = data.response.comments;
  }

  return (
    <Form
      onSubmit={(e: React.FormEvent) => {
        props.reply(({
          replyType: "InvalidQuestion",
          comments
        } as unknown) as any);
      }}
    >
      <CommentsInputComponent
        onChange={setComments}
        comments={comments}
        originalComments={originalComments}
      />
      <Button type="submit">Submit</Button>
    </Form>
  );
};

const DecomposerComponent: React.FunctionComponent<any> = props => {
  const data = (props.templateData as unknown) as DecomposerData; // TODO
  const isReview = "response" in data;
  let defaultActiveKey = "Decomposition";
  if (data.response != null) {
    defaultActiveKey = data.response.type;
  }

  return (
    <div className={isReview ? "reviewer container" : "decomposer container"}>
      <div className="banner">
        <h3 className="bannerText">
          {isReview
            ? "Factored Cognition Decomposer Review"
            : "Factored Cognition Decomposer"}
        </h3>
      </div>
      <div className="instructionPane cell">
        {isReview ? (
          <div>
            Review the following action, change it if it does not make sense,
            then submit as you normally would
          </div>
        ) : (
          <div>Choose the next action to take in decomposing this question</div>
        )}

        <a
          href="https://docs.google.com/document/d/169ruBULZtRGlYraFTIF_Qb4U2-eQe8va7-_eXyYD-U0/edit?usp=sharing"
          target="_blank"
          rel="noopener noreferrer"
        >
          Instructions for Decomposing Questions
        </a>
      </div>

      <div className="questionPane cell">
        <div>
          <TextComponent
            text={
              "Question: What is the " +
              data.question.property +
              " of " +
              data.question.entity +
              "?"
            }
          />
          <div>Depth Remaining {data.depth}</div>
        </div>
      </div>

      <div className="actionPane cell">
        <Tabs defaultActiveKey={defaultActiveKey} id="tabs" variant="pills">
          <Tab eventKey="Decomposition" title="Decompose">
            <div>
              Decompose question into simpler subquestions that would help you
              answer the original question
            </div>
            {
              <DecompositionFormComponent
                templateData={data}
                reply={props.reply}
              />
            }
          </Tab>
          <Tab eventKey="Answer" title="Pass on Question">
            <div>
              Use this option if you think the question makes sense, but you
              don't think it can be decomposed further
            </div>
            {<AnswerFormComponent templateData={data} reply={props.reply} />}
          </Tab>
          <Tab eventKey="InvalidQuestion" title="Question is Invalid">
            <div>
              Use this option if you think the question doesn't sense or is
              otherwise invalid
            </div>
            {
              <InvalidQuestionFormComponent
                templateData={data}
                reply={props.reply}
              />
            }
          </Tab>
        </Tabs>
      </div>
    </div>
  );
};

export default DecomposerComponent;
