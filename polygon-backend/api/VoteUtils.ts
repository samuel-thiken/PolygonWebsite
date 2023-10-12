import EventEmitter from "events";
import moment, { Moment } from "moment";
import { Databases } from "../utils/Database";

export type MapName =
  | "MP_Abandoned"
  | "MP_Damage"
  | "MP_Flooded"
  | "MP_Journey"
  | "MP_Naval"
  | "MP_Prison"
  | "MP_Resort"
  | "MP_Siege"
  | "MP_TheDish"
  | "MP_Tremors"
  | "XP0_Caspian"
  | "XP0_Firestorm"
  | "XP0_Metro"
  | "XP0_Oman"
  | "XP1_001"
  | "XP1_002"
  | "XP1_003"
  | "XP1_004"
  | "XP2_001"
  | "XP2_002"
  | "XP2_003"
  | "XP2_004"
  | "XP3_MarketPl"
  | "XP3_Prpganda"
  | "XP3_UrbanGdn"
  | "XP3_WtrFront"
  | "XP4_Arctic"
  | "XP4_SubBase"
  | "XP4_Titan"
  | "XP4_WlkrFtry"
  | "XP5_Night_01"
  | "XP6_CMP"
  | "XP7_Valley";

export enum Day {
  MONDAY = 1,
  TUESDAY = 2,
  WEDNESDAY = 3,
  THURSDAY = 4,
  FRIDAY = 5,
  SATURDAY = 6,
  SUNDAY = 7,
}
export enum VoteOptionType {
  ACTIVE,
  NORMAL,
  DISABLED,
}
export type VoteOption = {
  map: MapName;
  type: VoteOptionType;
};
export type VoteEntry = {
  user: number;
  map: MapName;
};
type VoteDate = {
  day: Day;
  hour: number;
};
export type VoteRecap = {
  map: MapName;
  count: number;
};

export default class VoteUtils extends EventEmitter {

  private static instance: VoteUtils = new VoteUtils();
  public static getInstance(): VoteUtils {
    return this.instance;
  }

  static VOTE_CHANGE_DATE: VoteDate = {
    day: Day.MONDAY,
    hour: 9
  };
  static MAPLIST_SIZE = 7;
  static FALLBACK_MAPS: Array<MapName> = ["MP_Flooded", "MP_Resort", "MP_TheDish", "MP_Tremors"];
  public static ALL_MAPS: Array<MapName> = [
    "MP_Abandoned",
    "MP_Damage",
    "MP_Flooded",
    "MP_Journey",
    "MP_Naval",
    "MP_Prison",
    "MP_Resort",
    "MP_Siege",
    "MP_TheDish",
    "MP_Tremors",
    "XP0_Caspian",
    "XP0_Firestorm",
    "XP0_Metro",
    "XP0_Oman",
    "XP1_001",
    "XP1_002",
    "XP1_003",
    "XP1_004",
    "XP2_001",
    "XP2_002",
    "XP2_003",
    "XP2_004",
    "XP3_MarketPl",
    "XP3_Prpganda",
    "XP3_UrbanGdn",
    "XP3_WtrFront",
    "XP4_Arctic",
    "XP4_SubBase",
    "XP4_Titan",
    "XP4_WlkrFtry",
    "XP5_Night_01",
    "XP6_CMP",
    "XP7_Valley"
  ];
  private current: Vote;
  private last: Vote;

  public getCurrentVote(): Vote {
    return this.current;
  }
  public getLastVote(): Vote {
    return this.last;
  }

  private async generateNewVote() {
    const endDate = this.getNext(VoteUtils.VOTE_CHANGE_DATE, 0);
    const id = (await Databases.polygon.query(`INSERT INTO mapvote_votes(end) VALUES (?)`, [endDate])) as number;
    if (this.current) this.last = this.current;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.current = new Vote(id, [], endDate);
    this.emit("newvote");
  }

  private async loadLastVote() {
    const endDate = moment(this.getNext(VoteUtils.VOTE_CHANGE_DATE, 0)).add(-1, "week").toDate();
    const votes = (await Databases.polygon.query(`SELECT * FROM mapvote_votes WHERE end = ?`, [endDate])) as Array<{ id: number; end: Date }>;
    if (!votes || votes.length == 0) return;
    const voteData = votes[0];
    const entries = (await Databases.polygon.query(`SELECT * FROM mapvote_vote_entries WHERE vote = ?`, [voteData.id])) as Array<{ id: number; vote: number; user: number; choice: MapName; randomizer: number }>;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.last = new Vote(voteData.id, entries, endDate);
  }

  private async loadOrGenerateVote() {
    const endDate = this.getNext(VoteUtils.VOTE_CHANGE_DATE, 0);
    const votes = (await Databases.polygon.query(`SELECT * FROM mapvote_votes WHERE end = ?`, [endDate])) as Array<{ id: number; end: Date }>;
    if (!votes || votes.length == 0) return this.generateNewVote();
    const voteData = votes[0];
    const entries = (await Databases.polygon.query(`SELECT * FROM mapvote_vote_entries WHERE vote = ?`, [voteData.id])) as Array<{ id: number; vote: number; user: number; choice: MapName; randomizer: number }>;
    // eslint-disable-next-line @typescript-eslint/no-use-before-define
    this.current = new Vote(voteData.id, entries, endDate);
  }

  public init(): void {
    const nextUpdate = this.getNext(VoteUtils.VOTE_CHANGE_DATE, 0).getTime() - new Date().getTime();
    this.loadOrGenerateVote();
    this.loadLastVote();
    setTimeout(() => {
      this.generateNewVote();
      setInterval(() => {
        this.generateNewVote();
      }, 1000 * 60 * 60 * 24 * 7);
    }, nextUpdate);
    console.log(`Next vote starting in ${moment.duration(nextUpdate, "milliseconds").humanize()}`);
  }

  public getNext(date: VoteDate, minute = 0): Date {
    let m: Moment = moment().isoWeekday(date.day);
    m = m.hours(date.hour).minutes(minute).seconds(0).milliseconds(0);
    if (m < moment()) m = m.add(1, "week");
    return m.toDate();
  }

  public async getCurrentMaplist(): Promise<Array<MapName>> {
    const lastVote = this.getLastVote();
    if (!lastVote) {
      // Return nothing (handled plugin side)
      return [];
    }
    const maplist = [...lastVote.getBaseMaps()];
    const mapsOrdered = (await Databases.polygon.query(
      `SELECT choice as map, COUNT(USER) AS users, SUM(randomizer) as sum_randomizer FROM mapvote_vote_entries WHERE vote = ? AND choice NOT IN (${lastVote
        .getBannedMaps()
        .map((m) => `'${m}'`)
        .join(",")}) GROUP BY map ORDER BY users DESC, sum_randomizer DESC LIMIT ?`,
      [lastVote.getId(), VoteUtils.MAPLIST_SIZE - maplist.length]
    )) as Array<{ map: MapName; users: number; sum_randomizer: number }>;
    const votedMaps = [...mapsOrdered.map((m) => m.map), ...VoteUtils.FALLBACK_MAPS];
    return [...maplist, ...votedMaps.slice(0, VoteUtils.MAPLIST_SIZE - maplist.length)];
  }

}

export class Vote {

  private id: number;
  private endDate: Date;
  private votesPerUser: {
    [key: number]: Array<MapName>;
  } = [];
  private baseMaps: Array<MapName> = ["MP_Journey", "MP_Siege", "MP_Resort"];
  private bannedMaps: Array<MapName> = ["XP0_Caspian", "XP0_Firestorm", "XP0_Metro", "XP0_Oman", "XP1_002", "XP1_003", "XP1_004", "XP2_001", "XP2_002", "XP2_003", "XP2_004", "XP3_MarketPl", "XP3_Prpganda", "XP3_UrbanGdn", "XP3_WtrFront", "XP4_Arctic", "XP4_SubBase", "XP4_Titan", "XP4_WlkrFtry", "XP5_Night_01", "XP6_CMP", "XP7_Valley", "XP1_001"];

  constructor(id: number, entries: Array<{ user: number; choice: MapName }>, end: Date) {
    this.id = id;
    this.endDate = end;
    for (const data of entries) {
      this.addEntry(
        {
          map: data.choice,
          user: data.user
        },
        false
      );
    }
  }

  public getId(): number {
    return this.id;
  }
  public getEndDate(): Date {
    return this.endDate;
  }
  public getBaseMaps(): Array<MapName> {
    return this.baseMaps;
  }
  public getBannedMaps(): Array<MapName> {
    return this.bannedMaps;
  }

  public getOptions(): Array<VoteOption> {
    return VoteUtils.ALL_MAPS.map((map) => ({
      map: map,
      type: this.baseMaps.includes(map) ? VoteOptionType.ACTIVE : this.bannedMaps.includes(map) ? VoteOptionType.DISABLED : VoteOptionType.NORMAL
    }));
  }
  public getNumberOfVotes(): number {
    return VoteUtils.MAPLIST_SIZE - this.baseMaps.length;
  }

  public getVotes(exceptUser?: number): Array<VoteRecap> {
    const result = {};
    for (const map of VoteUtils.ALL_MAPS) result[map] = 0;
    for (const user of Object.keys(this.votesPerUser)) {
      if (parseInt(user) === exceptUser) continue;
      for (const map of this.votesPerUser[user]) result[map]++;
    }
    const resultFormatted = [];
    for (const map of VoteUtils.ALL_MAPS) {
      resultFormatted.push({
        map: map,
        count: result[map]
      });
    }
    return resultFormatted;
  }
  public getUserVotes(user: number): Array<VoteRecap> {
    return this.votesPerUser[user] ? this.votesPerUser[user].map((map) => ({ map: map, count: 1 })) : [];
  }

  public addEntry(entry: VoteEntry, addDbEntry = true): void {
    if (this.bannedMaps.includes(entry.map) || this.baseMaps.includes(entry.map)) return;
    if (this.votesPerUser[entry.user]) {
      if (this.votesPerUser[entry.user].length >= VoteUtils.MAPLIST_SIZE - this.baseMaps.length) return;
      if (!this.votesPerUser[entry.user].includes(entry.map)) this.votesPerUser[entry.user].push(entry.map);
    } else {
      this.votesPerUser[entry.user] = [entry.map];
    }
    if (addDbEntry) Databases.polygon.query(`INSERT INTO mapvote_vote_entries(vote, user, choice, randomizer) VALUES (?, ?, ?, ?)`, [this.id, entry.user, entry.map, Math.round(Math.random() * 100)]);
  }

  public removeEntry(entry: VoteEntry): void {
    if (this.votesPerUser[entry.user] && this.votesPerUser[entry.user].includes(entry.map)) this.votesPerUser[entry.user].splice(this.votesPerUser[entry.user].indexOf(entry.map), 1);
    Databases.polygon.query(`DELETE FROM mapvote_vote_entries WHERE vote = ? AND user = ? AND choice = ?`, [this.id, entry.user, entry.map]);
  }

}
