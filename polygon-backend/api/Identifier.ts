import { Request } from "express";
import moment from "moment";
import { Databases } from "../utils/Database";

const users: {
  [key: string]: Promise<number>;
} = {};

function generateCode(): string {
  return Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);
}

export type RequestWithIdentifier = Request & { user: number; code: string } & { session: { identifier: string; user: number } };

let id = 0;
export const identify = async (req: RequestWithIdentifier, res, next) => {
  const lid = id++;
  const endIdentify = (code, user) => {
    res.cookie("identifier", code, {
      expires: moment().add(100, "years").toDate()
    });
    req.user = user;
    req.code = code;
    req.session.identifier = code;
    req.session.user = user;
    return next();
  };
  const getCodeByIp = async (ip) => {
    const result = (await Databases.polygon.query(`SELECT code FROM mapvote_users_ip WHERE ip = ?`, [ip])) as {code:string}[];
    if (result.length > 0) return result[0].code;
    return null;
  };
  const saveUserIP = (code, ip) => {
    Databases.polygon.query(`INSERT INTO mapvote_users_ip (code, ip) VALUES (?, ?) ON DUPLICATE KEY UPDATE code=code`, [code, ip]);
  };

  if (req.session.user && req.session.identifier) {
    // if (req.cookies.identifier !== req.session.identifier) {
    //   res.cookie("identifier", req.session.identifier, {
    //     expires: moment().add(100, "years").toDate()
    //   });
    // }
    // req.user = req.session.user;
    // req.code = req.session.identifier;
    // return next();
    endIdentify(req.session.identifier, req.session.user);
    return;
  }

  let CODE: string = req.session.identifier || req.cookies.identifier;
  const IP = (req.headers["x-forwarded-for"] || req.socket.remoteAddress) as string;
  let userId: number;

  // console.log(lid, `Ip: ${IP}, Code: ${CODE}`);

  try {
    if (CODE) {
      // Retrive the user id
      if (!users[CODE]) {
        const promise = new Promise<number>(async (resolve) => {
          // Search in database
          const user = (await Databases.polygon.query(`SELECT * FROM mapvote_users WHERE code = ?`, [CODE]))[0] as { id: number; code: string };
          if (!user) {
            // There shouldn't be any code
            // Search by ip
            CODE = await getCodeByIp(IP);
            if (!CODE) {
              // Nothing found for the given IP
              console.log(`No user found for IP ${IP} but a unknown code is present`);
              // Create the user and assign it a new code
              CODE = generateCode();
              res.cookie("identifier", CODE, {
                expires: moment().add(100, "years").toDate()
              });
              saveUserIP(CODE, IP);
              userId = (await Databases.polygon.query(`INSERT INTO mapvote_users(code) VALUES (?)`, [CODE])) as number;
            } else {
              // A code has been found, retrieving the corresponding user
              userId = ((await Databases.polygon.query(`SELECT id FROM mapvote_users WHERE code = ?`, [CODE])) as {id:number}[])[0].id;
              // console.log(lid, `User found by ip : Real code : ${CODE}, user: ${userId}`);
            }
          } else {
            userId = user.id;
          }
          resolve(userId);
        });
        users[CODE] = promise;
        await promise;
      } else {
        userId = await users[CODE];
      }
    } else {
      const promise = new Promise<number>(async (resolve) => {
        // Search by ip
        CODE = await getCodeByIp(IP);
        if (CODE) {
          // A code has been found, retrieving the corresponding user
          userId = ((await Databases.polygon.query(`SELECT id FROM mapvote_users WHERE code = ?`, [CODE])) as {id:number}[])[0].id;
          // console.log(lid, `User found by ip : Real code : ${CODE}, user: ${userId}`);
        } else {
          // Create the user and assign it a new code
          CODE = generateCode();
          res.cookie("identifier", CODE, {
            expires: moment().add(100, "years").toDate()
          });
          saveUserIP(CODE, IP);
          userId = (await Databases.polygon.query(`INSERT INTO mapvote_users(code) VALUES (?)`, [CODE])) as number;
          // console.log(lid, "Nothing found, creating user", userId, IP, CODE);
        }
        resolve(userId);
      });
      users[CODE] = promise;
      await promise;
    }
    req.user = userId;
    req.code = CODE;
    req.session.identifier = CODE;
    req.session.user = userId;
  } catch (e) {
    console.error("Error during user identification :", e);
  }

  if (!req.user) return res.status(401).send("You couldn't be identified, please contact an administrator");
  next();
};
