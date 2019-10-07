import * as React from 'react';
import Form from 'react-bootstrap/Form';
import InputGroup from 'react-bootstrap/InputGroup';


export interface CommentsInput {
    readonly comments: string
    readonly originalComments?: string
    readonly onChange: (comments: string) => void;
}

export const CommentsInputComponent: React.FunctionComponent<CommentsInput> = props => {
    return (
        <div>
            {(props.originalComments != null) ?
                <InputGroup>
                    <InputGroup.Prepend>
                        <InputGroup.Text>Original User Comments</InputGroup.Text>
                    </InputGroup.Prepend>
                    <Form.Control
                        value={props.originalComments}
                        disabled={true}
                    />
                </InputGroup >
                : null
            }

            <InputGroup>
                <InputGroup.Prepend>
                    <InputGroup.Text>{(props.originalComments != null) ? "Reviewer Comments" : "Comments"}</InputGroup.Text>
                </InputGroup.Prepend>
                <Form.Control
                    value={props.comments}
                    onChange={(evt: any) => {
                        props.onChange(evt.target.value)
                    }}
                />
            </InputGroup >
        </div>
    );
};