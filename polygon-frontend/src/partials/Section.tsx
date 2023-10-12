import React from "react";

function SectionDivider(props: {reverse: boolean; style?: React.CSSProperties;}): React.ReactElement {
    return (
        <svg className={`divider ${props.reverse ? "divider-reverse" : ""}`} xmlns="http://www.w3.org/2000/svg" height="0.666667in" viewBox="0 0 1000 300" width="100%" preserveAspectRatio="none">
            <path
                d="M -12.00,304.00 C -12.00,304.00 1015.00,-3.00 1015.00,-3.00 1015.00,-3.00 1014.00,313.00 1014.00,313.00 1014.00,313.00 -12.00,304.00 -12.00,304.00 Z"
            />
        </svg>
    );
}

export default function Section(props: { type?: "primary"|"secondary", children?: React.ReactNode, style?: React.CSSProperties, className?:string, contentClassName?:string}): React.ReactElement {
    const type = props.type || "secondary";
    return (
        <section className={`section section-${type} ${props.className}`} style={props.style}>
            {type !== "primary" && <SectionDivider reverse={false} />}
            <div className="section-content w-100">
                <div className={`w-80 centered ${props.contentClassName}`}>{props.children}</div>
            </div>
            {type !== "primary" && <SectionDivider reverse={true} />}
        </section>
    );
}
