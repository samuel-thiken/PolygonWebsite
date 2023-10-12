import express, { Request } from "express";
import moment from "moment";
import { Databases } from "../../utils/Database";
import Logger from "../../utils/Logger";
import { requireApiKey } from "./auth";

const router = express.Router();

const blacklist: Array<{
  table: string;
  method: "SELECT" | "DELETE" | "UPDATE" | "INSERT" | "*";
}> = [
  {
    table: "polycp_users",
    method: "*"
  },
  {
    table: "vsm_vips",
    method: "UPDATE"
  },
  {
    table: "vsm_vips",
    method: "INSERT"
  },
  {
    table: "*",
    method: "DELETE"
  },
  {
    table: "*",
    method: "INSERT"
  },
  {
    table: "*",
    method: "UPDATE"
  }
];

router.post("/query", requireApiKey, async (req: Request<any, any, { query: string }>, res) => {
  const { query } = req.body;
  const apiKey = req.headers["x-api-key"] as string;
  if (!query) res.status(400).send("Missing query");

  // Verifying the query
  const queryUpper = query.toUpperCase();
  // Check for sql injection
  if (query.split(";").length > 1) return res.status(400).send("Potential SQL Injection. If you try to execute multiple queries at the same time, use multiple requests.");
  // Check for blacklist
  for (const rule of blacklist) {
    if ((queryUpper.includes(rule.table) || rule.table === "*") && (queryUpper.includes(rule.method) || rule.method === "*")) {
      Logger.log(`{${apiKey}} - Rule enforced : ${JSON.stringify(rule)} - Query : ${query}`);
      return res.status(403).send("Query refused: a rule was enforced");
    }
  }

  try {
    const result = await Databases.polygon.query(query);
    return res.status(200).json({
      result: result
    });
  } catch (e) {
    return res.status(500).json({
      result: null,
      error: e
    });
  }
});

export default router;
