import * as dotenv from "dotenv";
dotenv.config({ path: "./config.env" });
import { start as api } from "./api/api";
import { start as bot } from "./bot/bot";
import PlayerCountTracker from "./utils/PlayerCountTracker";

api();
if (process.env.TRACKER_ENABLED !== "false") PlayerCountTracker.init();
if (process.env.DISCORD_BOT_ENABLED !== "false") bot();
