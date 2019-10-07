import * as React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';
import { AutoCompleteComponent } from './AutoCompleteComponent';
// import { Typeahead } from 'react-bootstrap-typeahead';
export interface FormalQuestion { property?: string, entity?: string }


export interface FormalQuestionInput {
    readonly required?: boolean
    readonly disabled?: boolean
    readonly label: string;
    readonly FormalQuestion: FormalQuestion;
    readonly propertyOptions: string[];
    readonly onChange: (FormalQuestion: FormalQuestion) => void;
}

export const FormalQuestionInputComponent: React.FunctionComponent<FormalQuestionInput> = props => {
    return (
        <InputGroup>
            <InputGroup.Prepend>
                <InputGroup.Text>{props.label}</InputGroup.Text>
            </InputGroup.Prepend>
            <span className="label-inline">What is the</span>
            <AutoCompleteComponent
                value={props.FormalQuestion.property}
                onChange={(value: string) =>
                    props.onChange({ ...props.FormalQuestion, property: value })}
                options={props.propertyOptions}
                required={true}
            />
            {
                // <Form.Control
                //     as="select"
                //     value={props.FormalQuestion.property}
                //     onChange={(evt: any) => {
                //         props.onChange({ ...props.FormalQuestion, property: evt.target.value })
                //     }}
                //     required={props.required}
                // >
                //     <option label=" "></option>
                //     {props.propertyOptions.map(property => <option>{property}</option>)}
                // </Form.Control>
            }
            <span className="label-inline">of</span>
            <Form.Control
                type="text"
                value={props.FormalQuestion.entity}
                onChange={(evt: any) => {
                    props.onChange({ ...props.FormalQuestion, entity: evt.target.value })
                }}
                required={props.required}
                className="entity-input"
            />
        </InputGroup >

    );
};