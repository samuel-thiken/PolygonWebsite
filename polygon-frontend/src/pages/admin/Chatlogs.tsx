import moment from "moment";
import { useContext, useState } from "react";
import ReactLoading from "react-loading";
import superagent from "superagent";
import Section from "../../partials/Section";
import { AuthContext } from "../../utils/Authentication";
import I18n from "../../utils/I18n";

type Chatlog = {
  date: Date;
  target: "Squad" | "Team" | "Global";
  player: string;
  message: string;
};

export default function Chatlogs(): React.ReactElement {
  const [chatlogs, setChatlogs] = useState<Array<Chatlog>>([]);
  const [loading, setLoading] = useState(false);

  const { token } = useContext(AuthContext);

  let playersRef: HTMLInputElement | null = null;

  const search = async (e: React.MouseEvent | React.FormEvent) => {
    e.preventDefault();
    if (!playersRef) return;
    setLoading(true);
    const players = playersRef.value
      .split(",")
      .map((p) => p.replace(/^ */, "").replace(/ *$/, ""))
      .filter(Boolean);
    const result = await superagent.post(`${process.env.REACT_APP_API_SERVER}/users/chatlogs`).set({ "x-access-token": token }).send({ players: players });
    setChatlogs(result.body);
    setLoading(false);
  };

  return (
    <>
      <Section type="primary">
        <div className="m-5">
          <p className="title">Chat logs</p>
          <p className="subtitle">
            <I18n t="stats.subtitle" />
          </p>
        </div>
        <div className="mt-5">
          <p>Here you can manage the server's vips</p>
        </div>
      </Section>
      <Section contentClassName="overflow-auto">
        <form onSubmit={search}>
          <div>
            <label htmlFor="player">
              Players (comma separated) <br />
              <input
                type="text"
                id="players"
                ref={(ref) => {
                  playersRef = ref;
                }}
              />
            </label>
          </div>
          <button className="bf-btn small mt-4" onClick={search}>
            Search
          </button>
        </form>
        {loading ? (
          <ReactLoading className="centered" type="bars" />
        ) : (
          <table className="table w-100">
            <thead>
              <tr>
                <th>Date</th>
                <th>Player</th>
                <th>Message</th>
              </tr>
            </thead>
            <tbody>
              {chatlogs.map((chatlog, i) => (
                <tr key={i} className={`chatlog row chatlog--${chatlog.target.toLowerCase()}`}>
                  <td>
                    <span className="cell-content">{moment(chatlog.date).format("dd D MMM | kk:mm:ss")}</span></td>
                  <td>
                    <span className="cell-content">{chatlog.player}</span></td>
                  <td>
                    <span className="cell-content">{chatlog.message}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </Section>
    </>
  );
}
