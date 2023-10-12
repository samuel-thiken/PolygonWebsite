import express, { Request } from "express";
import { identify } from "../Identifier";
import VoteUtils from "../VoteUtils";

const router = express.Router();

router.get("/current/settings", identify, (req: Request & { user: number }, res) => {
  res.status(200).json({
    data: {
      options: VoteUtils.getInstance().getCurrentVote().getOptions(),
      votes: VoteUtils.getInstance().getCurrentVote().getNumberOfVotes(),
      endDate: VoteUtils.getInstance().getCurrentVote().getEndDate()
    }
  });
});
router.get("/current/votes", identify, (req: Request & { user: number }, res) => {
  res.status(200).json({
    data: VoteUtils.getInstance().getCurrentVote().getVotes(req.user)
  });
});
router.get("/current/me", identify, (req: Request & { user: number }, res) => {
  res.status(200).json({
    data: VoteUtils.getInstance().getCurrentVote().getUserVotes(req.user)
  });
});
router.get("/last/settings", async (req, res) => {
  if (!VoteUtils.getInstance().getLastVote()) return res.sendStatus(404);
  res.status(200).json({
    data: {
      options: VoteUtils.getInstance().getLastVote().getOptions(),
      result: await VoteUtils.getInstance().getCurrentMaplist(),
      votes: VoteUtils.getInstance().getLastVote().getNumberOfVotes(),
      endDate: VoteUtils.getInstance().getLastVote().getEndDate()
    }
  });
});
router.get("/last/votes", (req, res) => {
  if (!VoteUtils.getInstance().getLastVote()) return res.sendStatus(404);
  res.status(200).json({
    data: VoteUtils.getInstance().getLastVote().getVotes()
  });
});
router.get("/maplist", async (req, res) => {
  res.status(200).send((await VoteUtils.getInstance().getCurrentMaplist()).join(","));
});

router.post("/vote", identify, (req: Request & { user: number }, res) => {
  const { map, type } = req.body;
  if (!map || !type) return res.status(400).send("Vote choice is incomplete");

  switch (type) {
    case "add":
      VoteUtils.getInstance().getCurrentVote().addEntry({
        map: map,
        user: req.user
      });
      break;
    case "remove":
      VoteUtils.getInstance().getCurrentVote().removeEntry({
        map: map,
        user: req.user
      });
      break;
  }

  res.sendStatus(200);
});

export default router;
