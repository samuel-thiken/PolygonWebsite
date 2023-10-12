import moment from "moment";
import React, { useEffect, useState } from "react";
import I18n, { PropsWithLocation, useI18n } from "./I18n";

export interface CountDownTexts {
    day: string | unknown;
    days: string | unknown;
    hour: string | unknown;
    hours: string | unknown;
    minute: string | unknown;
    minutes: string | unknown;
    second: string | unknown;
    seconds: string | unknown;
    and: string | unknown;
}

export default function CountDown(props: PropsWithLocation & { className?: string; children?: React.ReactNode; date: Date; onEnded?: () => void }): React.ReactElement {
    const tl = new Date(props.date || moment().add(-1, "day").toDate()).getTime() - new Date().getTime();

    const [ended, setEnded] = useState(tl <= 0);
    const [timeLeft, setTimeLeft] = useState<number>(tl);

    const { getI18nText } = useI18n();

    const format = (time: number): string => {
        let d = moment.duration(time, "milliseconds");
        if (!time || time == 0 || !d || d.asSeconds() < 1) return "...";
        const result: Array<string> = [];

        //Days
        const days = Math.floor(d.asDays());
        if (days > 0) result.push(`${days} ${days > 1 ? getI18nText("countdown.days") : getI18nText("countdown.day")}`);
        d = d.subtract(days, "days");

        //Hours
        const hours = Math.floor(d.asHours());
        if (hours > 0 || result.length > 0) result.push(`${hours} ${hours > 1 ? getI18nText("countdown.hours") : getI18nText("countdown.hour")}`);
        d = d.subtract(hours, "hours");

        //Minutes
        const minutes = Math.floor(d.asMinutes());
        if (minutes > 0 || result.length > 0) result.push(`${minutes} ${minutes > 1 ? getI18nText("countdown.minutes") : getI18nText("countdown.minute")}`);
        d = d.subtract(minutes, "minutes");

        //Seconds
        const seconds = Math.floor(d.asSeconds());
        if (seconds > 0 || result.length > 0) result.push(`${result.length > 0 ? `${getI18nText("countdown.and")} ` : ""}${seconds} ${seconds > 1 ? getI18nText("countdown.seconds") : getI18nText("countdown.second")}`);
        d = d.subtract(seconds, "seconds");

        return result.join(", ");
    };

    useEffect(() => {
        const interval = setInterval(() => {
            const t = new Date(props.date || moment().add(-1, "day").toDate()).getTime() - new Date().getTime();
            setTimeLeft(t);
            if (t <= 0) {
                clearInterval(interval);
                setEnded(true);
                if (props.onEnded) props.onEnded();
            }
        }, 1000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className={`countdown ${ended ? "countdown-ended" : ""} ${props.className || ""}`}>
            {ended && props.children}
            {!ended && format(timeLeft)}
        </div>
    );
}
