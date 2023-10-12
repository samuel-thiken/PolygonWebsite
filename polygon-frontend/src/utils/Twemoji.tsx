import React, { memo } from "react";
import twemoji from "twemoji";

const Twemoji = (props: { emoji: string; className?: string }) =>
    props.emoji ? (
        <span
            dangerouslySetInnerHTML={{
                __html: twemoji.parse(props.emoji, {
                    folder: "svg",
                    ext: ".svg"
                })
            }}
            className={props.className}
        />
    ) : (
        <span></span>
    );

export default memo(Twemoji);
