import EventEmitter from "events";
import moment, { Moment } from "moment";
import superagent from "superagent";
import { Databases } from "./Database";

interface RealRawInfos {
  snapshot: {
    currentMap: string;
    waitingPlayers: number;
    maxPlayers: number;
    teamInfo: {
      0: { players: { [key: string]: unknown } };
      1: { players: { [key: string]: unknown } };
      2: { players: { [key: string]: unknown } };
    };
  };
}
interface FakeRawInfos {
  slots: {
    "2": {
      current: number;
    };
  };
}
export interface PlayerCount {
  playing: number;
  queue: number;
  total: number;
  mapname: string;
}
interface PlayerCountData {
  day: `${number}/${number}/${number}`;
  hour: `${number}:${number}`;
  bots: number;
  playersMax: number;
  playersMin: number;
  playersAvg: number;
  total: number;
  map: string;
}

export const MapCodeToName = {
  MP_Abandoned: "Zavod",
  MP_Damage: "Lancang Dam",
  MP_Flooded: "Flood Zone",
  MP_Journey: "Golmud",
  MP_Naval: "Paracel",
  MP_Prison: "Locker",
  MP_Resort: "Hainan",
  MP_Siege: "Shanghai",
  MP_TheDish: "Rogue",
  MP_Tremors: "Dawnbreaker",
  XP1_001: "Silk Road",
  XP1_002: "Altai Range",
  XP1_003: "Guilin Peaks",
  XP1_004: "Dragon Pass",
  XP0_Caspian: "Caspian",
  XP0_Firestorm: "Firestorm",
  XP0_Metro: "Metro",
  XP0_Oman: "Oman",
  XP2_001: "Lost Islands",
  XP2_002: "Nansha",
  XP2_003: "Wavebreaker",
  XP2_004: "Mortar",
  XP3_MarketPl: "Pearl Market",
  XP3_Prpganda: "Propaganda",
  XP3_UrbanGdn: "Limphini",
  XP3_WtrFront: "Sunken Dragon",
  XP4_Arctic: "Whiteout",
  XP4_SubBase: "Hammerhead",
  XP4_Titan: "Hangar",
  XP4_WlkrFtry: "Giants",
  XP5_Night_01: "Zavod Night",
  XP6_CMP: "Outbreak",
  XP7_Valley: "Valley"
};

export default class PlayerCountTracker extends EventEmitter {

  private static UPDATE_INTERVAL = 15;
  private static FETCH_INTERVAL = 0.5;
  private static SERVER_SLOTS = 64;

  private static instance: PlayerCountTracker;
  public static getInstance(): PlayerCountTracker {
    return this.instance;
  }
  public static init() {
    this.instance = new PlayerCountTracker();
  }
  private constructor() {
    super();
    this.start();
  }

  private started = false;

  private fetchFakeInfos(): Promise<FakeRawInfos> {
    return new Promise<FakeRawInfos>((resolve, reject) => {
      try {
        superagent
        .get(`https://battlelog.battlefield.com/bf4/servers/getNumPlayersOnServer/pc/${process.env.TRACKED_SERVER_GUID}`)
        .set("accept", "json")
        .end((err, res) => {
          if (err) reject(err);
          else resolve(res.body as FakeRawInfos);
        });
      } catch (e) {
        reject(e);
      }
    });
  }
  private fetchRealInfos(): Promise<RealRawInfos> {
    return new Promise<RealRawInfos>((resolve, reject) => {
      try {
      superagent
        .get(`https://keeper.battlelog.com/snapshot/${process.env.TRACKED_SERVER_GUID}`)
        .set("accept", "json")
        .end((err, res) => {
          if (err) reject(err);
          else resolve(res.body as RealRawInfos);
        });
      } catch (e) {
        reject(e);
      }
    });
  }

  private data: {
    bots: number;
    playersMax: number;
    playersMin: number;
    playersAvg: number[];
    map: string;
  } = {
    bots: 0,
    playersMax: 0,
    playersMin: PlayerCountTracker.SERVER_SLOTS,
    playersAvg: [],
    map: undefined
  };

  private async fetch(): Promise<void> {
    setInterval(async () => {
      try {
        const fakeData = await this.fetchFakeInfos();
        const realData = await this.fetchRealInfos();

        const players =
          realData.snapshot.teamInfo && Object.values(realData.snapshot.teamInfo).length > 0 ?
            Object.values(realData.snapshot.teamInfo)
                .map((teamInfo) => Object.values(teamInfo.players).length)
                .reduce((a, b) => a + b) :
            0;
        const data: PlayerCount = {
          playing: players,
          queue: realData.snapshot.waitingPlayers,
          mapname: MapCodeToName[realData.snapshot.currentMap.split("/").pop()],
          total: realData.snapshot.maxPlayers
        };
        this.emit("playercountchanges", data);
        const bots = fakeData.slots[2].current - players;
        PlayerCountTracker.SERVER_SLOTS = realData.snapshot.maxPlayers;

        if (this.data.bots < bots) this.data.bots = bots;
        if (this.data.playersMax < players) this.data.playersMax = players;
        if (this.data.playersMin > players) this.data.playersMin = players;
        this.data.playersAvg.push(players);
        if (!this.data.map) this.data.map = realData.snapshot.currentMap.split("/").pop();
      } catch (e) {
        console.error("Couldn't fetch battlelog data", e.message);
      }
    }, PlayerCountTracker.FETCH_INTERVAL * 1000 * 60);
  }

  private async update(): Promise<void> {
    const date = PlayerCountTracker.getTodayDate().format("L");
    const hour = moment(new Date(Math.round(new Date().getTime() / (15 * 60 * 1000)) * 15 * 60 * 1000)).format("HH:mm");
    Databases.polygon.query(`INSERT INTO playercount (date, hour, bots, players_max, players_min, players_avg, map) VALUES (?, ?, ?, ?, ?, ?, ?)`, [date, hour, this.data.bots, this.data.playersMax, this.data.playersMin, this.data.playersAvg.reduce((a, b) => a + b, 0) / this.data.playersAvg.length, this.data.map]).catch((e) => {
      console.log(e);
    });
    this.data = {
      bots: 0,
      playersMax: 0,
      playersMin: PlayerCountTracker.SERVER_SLOTS,
      playersAvg: [],
      map: undefined
    };
  }

  public start(): void {
    if (this.started) return;
    this.started = true;
    this.fetch();
    const nextUpdate = PlayerCountTracker.UPDATE_INTERVAL * Math.ceil(moment().minute() / PlayerCountTracker.UPDATE_INTERVAL) - moment().minute();
    console.log(`Next playercount update in ${nextUpdate} minutes`);
    setTimeout(() => {
      this.update();
      setInterval(this.update.bind(this), PlayerCountTracker.UPDATE_INTERVAL * 60 * 1000);
    }, nextUpdate * 60 * 1000);
  }

  private static getTodayDate(): Moment {
    const realDate = moment();
    return realDate.hour() < 10 ? realDate.add(-1, "day") : realDate;
  }

  public static async getDate(date: Date): Promise<Array<PlayerCountData>> {
    try {
      return (await Databases.polygon.query(`SELECT date, hour, players_max as playersMax, players_min as playersMin, players_avg as playersAvg, map FROM playercount WHERE date = ?`, [moment(date).format("L")])) as Array<PlayerCountData>;
    } catch (e) {
      return [];
    }
  }

  public static async getAverage(startDate?: Date, endDate?:Date): Promise<Array<PlayerCountData>> {
    if (!startDate) startDate = new Date(2022, 0, 1);
    if (!endDate) endDate = new Date();
    try {
      // new Date(2023, 0, 27)
      return (await Databases.polygon.query(`SELECT hour, AVG(players_max) as playersMax, AVG(players_min) as playersMin, AVG(players_avg) as playersAvg from playercount WHERE date BETWEEN ? AND ? GROUP BY hour`, [moment(startDate).format("L"), moment(endDate).format("L"), true])) as Array<PlayerCountData>;
      // return (await Databases.polygon.query(`SELECT hour, AVG(bots) as bots, AVG(players) as players, Case When AVG(bots) + AVG(players) <= ${this.SERVER_SLOTS} Then AVG(bots) + AVG(players) else ${this.SERVER_SLOTS} end as total from playercount WHERE date BETWEEN ? AND ? GROUP BY hour`, [startDate, endDate])) as Array<PlayerCountData>;
    } catch (e) {
      return [];
    }
  }

}
