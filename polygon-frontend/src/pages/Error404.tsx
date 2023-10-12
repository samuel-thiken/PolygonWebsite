import React from "react";
import { Link } from "react-router-dom";
import Section from "../partials/Section";
import I18n from "../utils/I18n";

export default function Error404(): React.ReactElement {
  return (
    <>
      <Section className="middle">
        <p className="title">
          <I18n t="error404.notFound" />
        </p>
        <Link className="bf-btn mt-5" to="/">
          <I18n t="error404.backToMenu" />
        </Link>
      </Section>
    </>
  );
}
