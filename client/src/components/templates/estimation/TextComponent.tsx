import * as React from 'react';


const dummy: Element = document.createElement('textarea');
function escapeHTML(html: string): string {
    dummy.textContent = html;
    return dummy.innerHTML;
}

export interface TextComponentProps {
    readonly text: string;
}

export const TextComponent: React.FunctionComponent<TextComponentProps> = props => {
    const msg = escapeHTML(props.text);
    return <span>
        {msg.split('\n').map((item, key) => {
            return <React.Fragment key={key}>{item}<br /></React.Fragment>
        })}
    </span>;
}
