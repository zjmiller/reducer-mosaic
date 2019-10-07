import * as React from 'react';

export function validateForm(event: React.FormEvent, form: any, setValidated: (validated: boolean) => void): boolean {
    event.preventDefault();
    event.stopPropagation();
    if (form.checkValidity() === false) {
        setValidated(true);
        return false
    }
    return true
}
