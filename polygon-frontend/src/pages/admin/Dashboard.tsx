import Section from "../../partials/Section";
import I18n from "../../utils/I18n";

export default function Dashboard(): React.ReactElement {
  return (
    <>
      <Section type="primary">
        <div className="m-5">
          <p className="title">
            <I18n t="stats.title" />
          </p>
          <p className="subtitle">
            <I18n t="stats.subtitle" />
          </p>
        </div>
        <div className="mt-5">
          <p>
            <I18n t="stats.description" />
          </p>
        </div>
      </Section>
    </>
  );
}
