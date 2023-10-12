import { useEffect, useState } from "react";
import superagent from "superagent";
import MapElement, { Map, MapName, MapStatus } from "../partials/Map";
import Section from "../partials/Section";
import CountDown from "../utils/CountDown";
import I18n from "../utils/I18n";

enum VoteOptionType {
  ACTIVE,
  NORMAL,
  DISABLED,
}
type VoteOption = {
  map: MapName;
  type: VoteOptionType;
};
type VoteEntry = {
  map: MapName;
  count: number;
};

export default function NewVote(): React.ReactElement {
  // current vote
  const [voteOptions, setVoteOptions] = useState<Array<VoteOption>>([]);
  const [numberOfVotes, setNumberOfVotes] = useState(1);
  const [myVotes, setMyVotes] = useState<Array<VoteEntry>>([]);
  const [otherVotes, setOtherVotes] = useState<Array<VoteEntry>>([]);
  const [endDate, setEndDate] = useState<Date | null>(null);
  // last vote
  const [lastVoteOptions, setLastVoteOptions] = useState<Array<VoteOption>>([]);
  const [lastVoteNumberOfVotes, setLastVoteNumberOfVotes] = useState<number>(0);
  const [maplist, setMaplist] = useState<Array<MapName>>([]);
  const [lastVotes, setLastVotes] = useState<Array<VoteEntry>>([]);

  const agent = superagent.agent();
  // include cookies
  agent.withCredentials();

  useEffect(() => {
    // current vote
    agent.get(`${process.env.REACT_APP_API_SERVER}/vote/current/settings`, (error, result) => {
      if (!error) {
        setVoteOptions(result.body.data.options);
        setNumberOfVotes(result.body.data.votes);
        setEndDate(result.body.data.endDate);
      }
    });
    agent.get(`${process.env.REACT_APP_API_SERVER}/vote/current/votes`, (err, res) => {
      if (!err) setOtherVotes(res.body.data);
    });
    agent.get(`${process.env.REACT_APP_API_SERVER}/vote/current/me`, (err, res) => {
      if (!err) setMyVotes(res.body.data);
    });
    // last vote
    superagent.get(`${process.env.REACT_APP_API_SERVER}/vote/last/settings`, (error, result) => {
      if (!error) {
        setLastVoteOptions(result.body.data.options);
        setLastVoteNumberOfVotes(result.body.data.votes);
        setMaplist(result.body.data.result);
      }
    });
    superagent.get(`${process.env.REACT_APP_API_SERVER}/vote/last/votes`, (err, res) => {
      if (!err) setLastVotes(res.body.data);
    });
  }, []);

  const onVote = (map: Map): void => {
    let voteEntry: VoteEntry | undefined;
    if ((voteEntry = myVotes.find((v) => v.map === map.name))) {
      // Remove vote
      myVotes.splice(myVotes.indexOf(voteEntry), 1);
      agent
        .post(`${process.env.REACT_APP_API_SERVER}/vote/vote`)
        .send({
          type: "remove",
          map: map.name
        })
        .end((err) => {
          if (err) console.error(err);
        });
    } else {
      if (myVotes.length >= numberOfVotes) return;
      myVotes.push({
        map: map.name,
        count: 1
      });
      agent
        .post(`${process.env.REACT_APP_API_SERVER}/vote/vote`)
        .send({
          type: "add",
          map: map.name
        })
        .end((err) => {
          if (err) console.error(err);
        });
    }
    setMyVotes([...myVotes]);
  };

  return (
    <>
      <Section type="primary">
        <div className="m-5">
          <p className="title">
            <I18n t="vote.title" />
          </p>
          <p className="subtitle">
            <I18n t="vote.subtitle" />
          </p>
          <div className="mt-4">
            <p>
              <I18n t="vote.details.target" />
            </p>
          </div>
        </div>
      </Section>
      <Section>
        <p className="subtitle">
          <I18n t="vote.current" />
        </p>
        <p>
          <I18n t="vote.instructions" />
        </p>
        {endDate && (
          <div className="m-5">
            <p className="subsubtitle">
              <I18n t="index.vote.timeleft" />
            </p>
            <CountDown date={endDate}>
              <p className="subsubtitle">
                <I18n t="index.vote.ended" />
              </p>
            </CountDown>
          </div>
        )}
        <div className="mt-3">
          <p>
            <I18n t="vote.static" />
          </p>
          {voteOptions
            .filter((m) => m.type === VoteOptionType.ACTIVE)
            .map((option, i) => {
              const map = new Map(option.map);

              return <MapElement key={i} map={map} status={MapStatus.NONE} count={null} gamemode={null} />;
            })}
        </div>
        <div className="mt-3">
          <p>
            <I18n t="vote.vote" args={[numberOfVotes]} />
          </p>
          {voteOptions
            .filter((m) => m.type === VoteOptionType.NORMAL)
            .map((option, i) => {
              const map = new Map(option.map);
              const count = (otherVotes.find((v) => v.map === option.map)?.count || 0) + (myVotes.find((v) => v.map === option.map)?.count || 0);
              const status = myVotes.find((v) => v.map === option.map) ? MapStatus.ACTIVE : MapStatus.NONE;
              return <MapElement key={i} map={map} status={status} count={null} gamemode={null} onClick={onVote} />;
            })}
        </div>
      </Section>
      <Section>
        <p className="subtitle">
          <I18n t="vote.results" />
        </p>
        <div>
          <p>
            <I18n t="vote.static" />
          </p>
          {lastVoteOptions
            .filter((m) => m.type === VoteOptionType.ACTIVE)
            .map((option, i) => {
              const map = new Map(option.map);

              return <MapElement key={i} map={map} status={MapStatus.ACTIVE} count={null} gamemode={null} />;
            })}
        </div>
        <div className="mt-4">
          <p>
            <I18n t="vote.resultMaps" args={[lastVoteNumberOfVotes]} />
          </p>
          {lastVoteOptions
            .filter((m) => m.type === VoteOptionType.NORMAL)
            .map((option, i) => {
              const map = new Map(option.map);
              const count = lastVotes.find((v) => v.map === option.map)?.count || 0;
              const status = maplist.find((m) => m === option.map) ? MapStatus.ACTIVE : MapStatus.NONE;
              return <MapElement key={i} map={map} status={status} count={count} gamemode={null} />;
            })}
        </div>
      </Section>
    </>
  );
}
