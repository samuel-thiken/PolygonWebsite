import { Databases } from "../utils/Database";

export default class Chatlog {

  public static async getChatlogs(options: { players: string[] }): Promise<Array<Chatlog>> {
    if (options.players.length > 0) return (await Databases.polygon.query(`SELECT logDate as date, logSubset as target, logSoldierName as player, logMessage as message FROM tbl_chatlog WHERE logSoldierName IN (${options.players.map(() => "?").join(", ")}) ORDER BY date DESC LIMIT 200`, [...options.players])) as Array<Chatlog>;
    else return (await Databases.polygon.query(`SELECT logDate as date, logSubset as target, logSoldierName as player, logMessage as message FROM tbl_chatlog ORDER BY date DESC LIMIT 200`, [])) as Array<Chatlog>;
  }

  public date: Date;
  public target: "Squad" | "Team" | "Global";
  public player: string;
  public message: string;

}
