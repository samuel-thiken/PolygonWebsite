import { useEffect, useState } from "react";
import ReactLoading from "react-loading";
import superagent from "superagent";

type TopPlayer = {
  SoldierName: string;
  Score: number;
  Kills: number;
  Deaths: number;
  Headshots: number;
};

export default function Leaderboard() {
  const [top10, setTop10] = useState<Array<TopPlayer>>();

  useEffect(() => {
    superagent.get(`${process.env.REACT_APP_API_SERVER}/vote/last/settings`, (error, result) => {
      if (!error) setTop10(result.body);
    });
  }, []);

  return (
    <div>
      {top10 ? (
        <table>
          <thead>
            <th>
                <td>Player</td>
                <td>Kills</td>
                <td>Score</td>
                <td>Headshots</td>
                <td>Deaths</td>
            </th>
          </thead>
          <tbody>
            {top10.map((player) => (
              <tr>
                <td>{player.SoldierName}</td>
                <td>{player.Kills}</td>
                <td>{player.Score}</td>
                <td>{player.Headshots}</td>
                <td>{player.Deaths}</td>
              </tr>
            ))}
          </tbody>
        </table>
      ) : (
        <ReactLoading className="centered" type="bars" />
      )}
    </div>
  );
}
