import React from "react";
import Section from "../partials/Section";
import I18n, { useI18n } from "../utils/I18n";
import Twemoji from "../utils/Twemoji";

export default function Vip(): React.ReactElement {
    const { getI18nArray } = useI18n();
    return (
        <>
            <Section type="primary">
                <div className="m-5">
                    <p className="title"><I18n t="vip.title" /></p>
                    <p className="subtitle"><I18n t="vip.subtitle" /></p>
                </div>
                <div className="mt-5">
                    <p><I18n t="vip.explanation.help" /></p>
                    <p><I18n t="vip.explanation.activation" /></p>
                    <p><I18n t="vip.explanation.alive" /></p>
                </div>
            </Section>
            <Section type="secondary">
                <p className="subtitle text-uppercase vip-section-title"><I18n t="vip.benefits.title" /></p>
                <ul className="vip-benefits">
                    {getI18nArray<{name: string, description: string}>("vip.benefits.list").map((benefit, i) => (
                        <li key={i} className="vip-benefit">
                            <p className="vip-benefit-name">{benefit.name}</p>
                            <p className="vip-benefit-description" dangerouslySetInnerHTML={{ __html: benefit.description as string }}></p>
                        </li>
                    ))}
                </ul>
            </Section>
            <Section type="primary">
                <p className="subtitle text-uppercase vip-section-title"><I18n t="vip.price.title" /></p>
                <ul className="vip-prices">
                    {getI18nArray<string>("vip.price.list").map((p, i) => (
                        <li key={i} className="vip-price">
                            <strong>{p}</strong>
                        </li>
                    ))}
                </ul>
            </Section>
            <Section type="secondary">
                <p className="subtitle text-uppercase vip-section-title"><I18n t="vip.send.title" /></p>
                {/* <p dangerouslySetInnerHTML={{ __html: texts.send.details as string }}></p> */}
                <I18n t="vip.send.details" component={<p></p>} />
                <div className="needs-attention">
                    <Twemoji emoji={"⚠️"} /><p className="m-0"><I18n t="vip.send.pseudo" /></p><Twemoji emoji={"⚠️"}/>
                </div>
                <a className="bf-btn m-5 p-3" href="https://paypal.me/polygonBF4/">
                    <I18n t="vip.send.link" />
                </a>
                <p><I18n t="vip.send.help" /></p>
                <div className="columns">
                    <div className="column">
                        <span className="bold">
                            Discord
                        </span>
                        <div className="column">
                        {getI18nArray("vip.send.contacts.discord").map((username, i) => (
                            <span key={i}>
                                {username as string}
                            </span>
                        ))}
                        </div>
                    </div>
                    <div className="column">
                        <span className="bold">
                            Battlelog
                        </span>
                        <div className="column">
                        {getI18nArray("vip.send.contacts.battlelog").map((username, i) => (
                            <span key={i}>
                                {username as string}
                            </span>
                        ))}
                        </div>
                    </div>
                </div>
                <p className="small mt-3"><I18n t="vip.send.refund" /></p>
            </Section>
        </>
    );
}
