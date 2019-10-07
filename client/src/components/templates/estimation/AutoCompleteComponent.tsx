import * as React from 'react';
import Autosuggest from 'react-autosuggest';
import Form from 'react-bootstrap/Form';

export interface AutoCompleteComponentInput {
    readonly options: string[];
    readonly value?: string;
    readonly onChange: (value: string) => void;
    readonly required?: boolean;
}

export const AutoCompleteComponent: React.FunctionComponent<AutoCompleteComponentInput> = props => {
    const [suggestions, setSuggestions] = React.useState(Array<string>(0));

    const getSuggestions = (value: string) => {
        const inputValue = value.trim().toLowerCase();
        const inputLength = inputValue.length;


        return inputLength === 0 ? props.options : props.options.filter(s =>
            s.toLowerCase().slice(0, inputLength) === inputValue
        );
    };

    // When suggestion is clicked, Autosuggest needs to populate the input
    // based on the clicked suggestion. Teach Autosuggest how to calculate the
    // input value for every given suggestion.
    const getSuggestionValue = (suggestion: string) => suggestion;
    // Use your imagination to render suggestions.
    const renderSuggestion = (suggestion: string) => (
        <div>
            {suggestion}
        </div>
    );

    const onChange = (event: any, { newValue }: { newValue: string }) => {
        props.onChange(newValue);
    };

    // Autosuggest will call this function every time you need to update suggestions.
    // You already implemented this logic above, so just use it.
    const onSuggestionsFetchRequested = ({ value }: { value: string }) => {
        setSuggestions(getSuggestions(value));
    };

    // Autosuggest will call this function every time you need to clear suggestions.
    const onSuggestionsClearRequested = () => {
        setSuggestions([]);
    };

    const renderInputComponent = (inputProps: any) => (
        <div>
            <Form.Control
                type="text"
                required={props.required}
                {...inputProps}
            ></Form.Control>
        </div>
    );


    // Autosuggest will pass through all these props to the input.
    const inputProps = {
        // placeholder: '',
        value: props.value === undefined ? "" : props.value,
        required: props.required,
        onChange
    };

    function shouldRenderSuggestions(value: string) {
        return true;
    }

    // Finally, render it!
    return (
        <Autosuggest
            suggestions={suggestions}
            onSuggestionsFetchRequested={onSuggestionsFetchRequested}
            onSuggestionsClearRequested={onSuggestionsClearRequested}
            getSuggestionValue={getSuggestionValue}
            renderSuggestion={renderSuggestion}
            inputProps={inputProps}
            renderInputComponent={renderInputComponent}
            shouldRenderSuggestions={shouldRenderSuggestions}
        />
    );
};
