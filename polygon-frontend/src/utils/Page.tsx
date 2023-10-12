import { useEffect } from "react";

const Page = (props: Record<string, unknown>) => {
    useEffect(() => {
        document.title = (props.title as string) || "";
    }, [props.title]);
    return props.children;
};

export default Page;
