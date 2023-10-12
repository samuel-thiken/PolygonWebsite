import express, { Request } from "express";
import PlayerCountTracker from "../../utils/PlayerCountTracker";

const router = express.Router();

router.get("/date", async (req: Request<any, any, any, {date: Date}>, res) => {
  const { date } = req.query;
  res.json({
    data: await PlayerCountTracker.getDate(date)
  });
});
router.get("/average", async (req: Request<any, any, any, {startDate?: Date, endDate?: Date}>, res) => {
  const { startDate, endDate } = req.query;
  res.json({
    data: await PlayerCountTracker.getAverage(startDate, endDate)
  });
});

export default router;
