import * as React from 'react';
import Form from 'react-bootstrap/Form';
import { FormControlProps } from 'react-bootstrap/FormControl';
import InputGroup from 'react-bootstrap/InputGroup';


export interface TextInputProps {
    readonly disabled?: boolean
    readonly required?: boolean
    readonly label: string;
    readonly inputText: string;
    readonly onChange: (evt: React.FormEvent<FormControlProps>) => void;
}

export const TextInputComponent: React.FunctionComponent<TextInputProps> = props => {
    return (

        <InputGroup>
            <InputGroup.Prepend>
                <InputGroup.Text>{props.label}</InputGroup.Text>
            </InputGroup.Prepend>
            <Form.Control
                type="text"
                value={props.inputText}
                onChange={props.onChange}
                required={props.required}
            ></Form.Control>
        </InputGroup>

    );
};