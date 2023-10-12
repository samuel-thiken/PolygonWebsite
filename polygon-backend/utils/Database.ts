import { OkPacket } from "mysql2";
import * as mysql from "mysql2";
import bcrypt from "bcrypt";
import Role, { Permission } from "../models/Role";

export interface ConnectionInfos {
  host: string;
  user: string;
  password: string;
  database: string;
  port?: number;
  charset?: string;
}

class Database {

  private connectionInfos: ConnectionInfos;
  private connection: mysql.Connection | null;
  public connected: boolean;

  constructor(connectionInfos: ConnectionInfos) {
    this.connectionInfos = connectionInfos;
    this.connection = null;
  }

  private connecting: Promise<void>;
  private attempts = 0;

  public connect(reset?: boolean): Promise<void> {
    if (!this.connecting || reset) {
      this.connected = false;
      const p = new Promise<void>((resolve) => {
        this.c(resolve);
      });
      this.connecting = p;
      p.then(() => {
        this.connected = true;
        console.log(`Connected to database "${this.connectionInfos.database}"`);
      });
    }
    return this.connecting;
  }
  private c(p: (value: void | PromiseLike<void>) => void): void {
    this.attempts++;
    if (this.attempts >= 2) console.log(`Connecting to database "${this.connectionInfos.database}" ... (attempt ${this.attempts})`);
    if (this.attempts === 20) console.log("To much attempts trying to connect to database, adding a timeout");

    this.connection = mysql.createConnection(this.connectionInfos);
    this.connection.connect((err) => {
      if (!err) p();
    });

    this.connection.on("error", (err: mysql.QueryError) => {
      console.log(err);
      if (["PROTOCOL_ENQUEUE_AFTER_FATAL_ERROR", "PROTOCOL_CONNECTION_LOST", "ETIMEDOUT", "ECONNRESET"].includes(err.code)) {
        if (this.connected) this.connect(true);
        else this.c(p);
      } else {
        setTimeout(() => {
          if (this.connected) this.connect.bind(this, true)();
          else this.c.bind(this, p)();
        }, 5000 * (this.attempts >= 20 ? 60 : 1));
      }
    });
  }

  public async query<T = Record<string, unknown>>(query: string, inserts: Array<unknown> = [], log?: boolean): Promise<number | T[]> {
    if (!this.connected) await this.connect();
    if (!query) return [];

    query = mysql.format(query, inserts);

    if (log) console.log(query);

    return new Promise((resolve, reject) => {
      if (!this.connection) return reject(new Error("Database not connected"));
      this.connection.query(query, async (error, result) => {
        if (error) {
          if (["ECONNRESET"].includes(error.code)) {
            await this.connect(true);
            this.query(query)
              .then((res) => {
                resolve(res as T[]);
              })
              .catch((e) => {
                reject(e);
              });
          } else {
            console.log(error.message, query);
            return reject(error);
          }
        }
        if ((result as OkPacket).insertId) return resolve((result as OkPacket).insertId);
        else return resolve(result as T[]);
      });
    });
  }

}

export const Databases = {
  polygon: new Database({
    host: process.env.DATABASE_HOST as string,
    user: process.env.DATABASE_USER as string,
    password: process.env.DATABASE_PASSWORD as string,
    database: process.env.DATABASE_DATABASE as string,
    port: 3306,
    charset: "utf8mb4"
  })
};

async function createSchema(database: Database) {
  database
    .query(
      `CREATE TABLE IF NOT EXISTS mapvote_gamemodes (
        code varchar(50) NOT NULL,
        name varchar(50) NOT NULL,
        PRIMARY KEY code (code)
    ) ENGINE=InnoDB;`
    )
    .then(() => {
      database.query(`INSERT INTO mapvote_gamemodes (code, name) VALUES
        ('ConquestLarge0', 'Conquest Large'),
        ('ConquestSmall0', 'Conquest Small') ON DUPLICATE KEY UPDATE code=code;`);
    });
  database
    .query(
      `CREATE TABLE IF NOT EXISTS mapvote_maps (
        code varchar(30) NOT NULL,
        name varchar(50) NOT NULL,
        PRIMARY KEY code (code)
      ) ENGINE=InnoDB;`
    )
    .then(() => {
      database.query(`INSERT INTO mapvote_maps (code, name) VALUES
        ('MP_Abandoned', 'Zavod 311'),
        ('MP_Damage', 'Lancang Dam'),
        ('MP_Flooded', 'Flood Zone'),
        ('MP_Journey', 'Golmud Railway'),
        ('MP_Naval', 'Paracel Storm'),
        ('MP_Prison', 'Operation Locker'),
        ('MP_Resort', 'Hainan Resort'),
        ('MP_Siege', 'Siege of Shanghai'),
        ('MP_TheDish', 'Rogue Transmission'),
        ('MP_Tremors', 'Dawnbreaker'),
        ('XP0_Caspian', 'Caspian Border'),
        ('XP0_Firestorm', 'Operation Firestorm'),
        ('XP0_Metro', 'Operation Metro'),
        ('XP0_Oman', 'Gulf of Oman'),
        ('XP1_001', 'Silk Road'),
        ('XP1_002', 'Altai Range'),
        ('XP1_003', 'Guilin Peaks'),
        ('XP1_004', 'Dragon Pass'),
        ('XP2_001', 'Lost Islands'),
        ('XP2_002', 'Nansha Strike'),
        ('XP2_003', 'Wave Breaker'),
        ('XP2_004', 'Operation Mortar'),
        ('XP3_MarketPl', 'Pearl Market'),
        ('XP3_Prpganda', 'Propaganda'),
        ('XP3_UrbanGdn', 'Lumpini Garden'),
        ('XP3_WtrFront', 'Sunken Dragon'),
        ('XP4_Arctic', 'Operation Whiteout'),
        ('XP4_SubBase', 'Hammerhead'),
        ('XP4_Titan', 'Hangar 21'),
        ('XP4_WalkerFactory', 'Giants of Karelia'),
        ('XP5_Night_01', 'Zavod: Graveyard Shift'),
        ('XP6_CMP', 'Operation Outbreak'),
        ('XP7_Valley', 'Dragon Valley') ON DUPLICATE KEY UPDATE code=code;
    `);
    });
  database.query(`CREATE TABLE IF NOT EXISTS playercount (
        date varchar(10) NOT NULL,
        hour varchar(5) NOT NULL,
        bots int NOT NULL DEFAULT '0',
        players_max int NOT NULL DEFAULT '0',
        players_min int NOT NULL DEFAULT '0',
        players_avg int NOT NULL DEFAULT '0',
        map varchar(50) DEFAULT NULL,
        PRIMARY KEY (date,hour)
    ) ENGINE=InnoDB;`);
  database.query(`CREATE TABLE IF NOT EXISTS mapvote_users (
        id int NOT NULL AUTO_INCREMENT,
        code varchar(50) NOT NULL,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`);
  database.query(`CREATE TABLE IF NOT EXISTS mapvote_users_ip (
        code varchar(50) NOT NULL,
        ip varchar(20) NOT NULL,
        PRIMARY KEY (code)
      ) ENGINE=InnoDB;`);
  database.query(`CREATE TABLE IF NOT EXISTS mapvote_votes (
        id int NOT NULL AUTO_INCREMENT,
        end datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (id)
      ) ENGINE=InnoDB;`);
  database.query(`CREATE TABLE IF NOT EXISTS mapvote_vote_entries (
        id int NOT NULL AUTO_INCREMENT,
        vote int NOT NULL,
        user varchar(50) NOT NULL,
        choice varchar(50) NOT NULL,
        randomizer int NOT NULL DEFAULT '1',
        PRIMARY KEY (id)
      ) ENGINE=InnoDB; `);
  database
    .query(
      `CREATE TABLE IF NOT EXISTS polycp_roles (
        role_id int NOT NULL AUTO_INCREMENT,
        role_name varchar(50) DEFAULT NULL,
        PRIMARY KEY (role_id)
      ) ENGINE=InnoDB;`
    )
    .then(() => {
      database.query(`INSERT INTO polycp_roles (role_id, role_name) VALUES
        (1, 'Guest'), (${Role.ADMIN_ROLE_ID}, 'Full Admin') ON DUPLICATE KEY UPDATE role_id=role_id;`);
    });
  database
    .query(
      `CREATE TABLE IF NOT EXISTS polycp_users (
        user_name varchar(50) NOT NULL,
        user_pass varchar(100) NOT NULL,
        user_role int DEFAULT '0',
        PRIMARY KEY (user_name) USING BTREE,
        KEY user_role_fk (user_role),
        CONSTRAINT user_role_fk FOREIGN KEY (user_role) REFERENCES polycp_roles (role_id) ON DELETE RESTRICT ON UPDATE CASCADE
      ) ENGINE=InnoDB;`
    )
    .then(async () => {
      database.query(
        `INSERT INTO polycp_users (user_name, user_pass, user_role) VALUES
        ('admin', ?, 2) ON DUPLICATE KEY UPDATE user_name=user_name;`,
        [await bcrypt.hash(process.env.DATABASE_PASSWORD, 10)]
      );
    });
  (async () => {
    const permissions = Object.values(Permission).filter((p) => typeof p !== "number");
    await database.query(`CREATE TABLE IF NOT EXISTS polycp_role_permissions (
            permission_id int NOT NULL,
            permission_name varchar(50) NOT NULL,
            PRIMARY KEY (permission_id)
          ) ENGINE=InnoDB;`);
    await database.query(`INSERT INTO polycp_role_permissions (permission_id, permission_name) VALUES ${permissions.map((p) => `(${Permission[p]}, '${p}')`).join(", ")} ON DUPLICATE KEY UPDATE permission_id=permission_id;`);
    await database.query(`CREATE TABLE IF NOT EXISTS polycp_granted_permissions (
                role_id int DEFAULT NULL,
                permission_id int DEFAULT NULL,
                KEY granted_permissions_role_id (role_id),
                KEY granted_permissions_permission_id (permission_id),
                CONSTRAINT granted_permissions_permission_id FOREIGN KEY (permission_id) REFERENCES polycp_role_permissions (permission_id) ON DELETE CASCADE ON UPDATE CASCADE,
                CONSTRAINT granted_permissions_role_id FOREIGN KEY (role_id) REFERENCES polycp_roles (role_id) ON DELETE CASCADE ON UPDATE CASCADE
              ) ENGINE=InnoDB;`);
    database.query(`INSERT INTO polycp_granted_permissions (role_id, permission_id) VALUES ${permissions.map((p) => `(${Role.ADMIN_ROLE_ID}, ${Permission[p]})`).join(", ")} ON DUPLICATE KEY UPDATE permission_id=permission_id;`);
  })();
}

Databases.polygon.connect().then(() => {
  createSchema(Databases.polygon);
});
