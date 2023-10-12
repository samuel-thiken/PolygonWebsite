import React, { useEffect, useState } from "react";
import superagent from "superagent";
import Section from "../partials/Section";
import CountDown from "../utils/CountDown";
import I18n from "../utils/I18n";
import ReactLoading from "react-loading";
import { Link } from "react-router-dom";
import MapElement, { MapName, Map } from "../partials/Map";
import "../assets/PuristaMedium.woff";

export default function Home(): React.ReactElement {
  const [maplist, setMaplist] = useState<Array<MapName>>([]);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const serverUrl = process.env.REACT_APP_BATTLELOG_URL;

  useEffect(() => {
    superagent.get(`${process.env.REACT_APP_API_SERVER}/vote/last/settings`, (error, result) => {
      if (!error) setMaplist(result.body.data.result);
    });
    superagent.get(`${process.env.REACT_APP_API_SERVER}/vote/current/settings`, (error, result) => {
      if (!error) setEndDate(result.body.data.endDate);
    });
  }, []);

  return (
    <>
      <Section>
        <div className="m-5">
          <p className="title">
            <I18n t="index.title" />
          </p>
          <p className="subtitle">
            <I18n t="index.subtitle" />
          </p>
          <p>
            <I18n t="index.description" />
          </p>
        </div>
        <a href={serverUrl} target="_blank" className="bf-btn arrow">
          <I18n t="index.join" />
        </a>
      </Section>
      <Section>
        <div className="mt-4 d-flex justify-content-around flex-wrap">
          <div className="d-flex flex-column align-items-center" style={{ flexBasis: 0 }}>
            <p className="subtitle">
              <I18n t="index.vote.maplist.current" />
            </p>
            <p>
              <I18n t="index.vote.maplist.description" />
            </p>
            <div className="mt-5">
            {maplist ? <>{maplist ? maplist.map((map, i) => <MapElement key={i} map={new Map(map)} />) : <ReactLoading className="centered" type="bars" />}</> : <ReactLoading className="centered" type="bars" />}
            </div>
          </div>
        </div>
      </Section>
      <Section>
        <p className="subtitle">
          <I18n t="index.vote.title" />
        </p>
        <I18n t="index.vote.description" component={<p></p>} />
        {endDate && (
          <>
            <p className="mt-4 subsubtitle">
              <I18n t="index.vote.timeleft" />
            </p>
            <CountDown date={endDate} className="m-4">
              <p className="subsubtitle">
                <I18n t="index.vote.ended" />
              </p>
            </CountDown>
          </>
        )}
        <Link to="/vote" className="bf-btn mt-5">
          <I18n t="index.vote.votenow" />
        </Link>
      </Section>
    </>
  );
}
