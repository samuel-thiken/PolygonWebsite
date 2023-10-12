import { Databases } from "../utils/Database";

export class Entry {

  public SoldierName: string;
  public Score: number;
  public Kills: number;
  public Deaths: number;
  public Headshots: Number;

}

class Leaderboard {

  public static async getTop10Kills(): Promise<Array<Entry>> {
    const query = `SELECT tpd.SoldierName, tps.Score, tps.Kills, tps.Deaths, tps.Headshots 
                    FROM tbl_playerstats tps
                    INNER JOIN tbl_server_player tsp ON  tsp.StatsID = tps.StatsID
                    INNER JOIN tbl_playerdata tpd ON tsp.PlayerID = tpd.PlayerID
                    WHERE tsp.ServerID = 1 AND tps.rankKills BETWEEN 1 AND 10 
                    ORDER BY tps.rankKills ASC`;
    return await Databases.polygon.query(query) as Array<Entry>;
  }

}

export default Leaderboard;
