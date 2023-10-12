import express from "express";
import Leaderboard from "../../models/Leaderboard";

const router = express.Router();

router.get("/top10kills", async (req, res) => {
  res.status(200).json(await Leaderboard.getTop10Kills());
});

export default router;
