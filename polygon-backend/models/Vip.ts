import { Databases } from "../utils/Database";

export enum VipStatus {
  ACTIVE = 0,
  INACTIVE = 1,
  EXPIRED = 2
}

export default class Vip {

  public static async getVipList(): Promise<Array<Vip>> {
    const vips = (await Databases.polygon.query(`SELECT * FROM vsm_vips`)) as Array<{ ID: number; gametype: string; servergroup: number; playername: string; timestamp: Date; status: string; admin: string; comment: string; guid: string }>;
    if (vips == null) return [];
    return vips.map((v) => new Vip(v.ID, v.gametype, v.servergroup, v.playername, v.timestamp, VipStatus[v.status.toUpperCase()]));
  }

  public static async update(vip: { id: number; player: string; expiresAt: Date; status: VipStatus }, admin: string): Promise<void> {
    await Databases.polygon.query(`UPDATE vsm_vips SET playername=?, timestamp=?, status=?, admin=? WHERE id=?`, [vip.player, new Date(vip.expiresAt).toJSON().slice(0, 19).replace("T", " "), VipStatus[vip.status].toLowerCase(), admin, vip.id]);
  }
  public static async create(vip: { player: string; expiresAt: Date; status: VipStatus }, admin: string): Promise<Vip> {
    const result = new Vip(-1, "BF4", 1, vip.player, vip.expiresAt, vip.status);
    const id = (await Databases.polygon.query(`INSERT INTO vsm_vips(gametype, servergroup, playername, timestamp, status, admin) VALUES (?, ?, ?, ?, ?, ?)`, [result.gametype, result.servergroup, result.player, new Date(result.expiresAt).toJSON().slice(0, 19).replace("T", " "), VipStatus[result.status].toLowerCase(), admin])) as number;
    result.id = id;
    return result;
  }
  public static async delete(vip: { id: number }, admin: string): Promise<void> {
    await Databases.polygon.query(`DELETE FROM vsm_vips WHERE id=?`, [vip.id]);
  }

  public id: number;
  public gametype: string;
  public servergroup: number;
  public player: string;
  public expiresAt: Date;
  public status: VipStatus;

  public constructor(id: number, gametype: string, servergroup: number, player: string, expiresAt: Date, status: VipStatus) {
    this.id = id;
    this.gametype = gametype;
    this.servergroup = servergroup;
    this.player = player;
    this.expiresAt = expiresAt;
    this.status = status;
  }

}
