import express from "express";
import Chatlog from "../../models/Chatlog";
import { Permission } from "../../models/Role";
import User from "../../models/User";
import Vip from "../../models/Vip";
import { authenticate, AuthenticatedRequest, requirePermission } from "./auth";

const router = express.Router();

router.post("/create", authenticate, requirePermission(Permission.MANAGE_ACCOUNTS), async (req, res) => {
  try {
    User.create(req.body.username, req.body.password);
    res.status(200).send("OK");
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
router.get("/vips", authenticate, requirePermission(Permission.MANAGE_VIPS), async (req, res) => {
  res.status(200).json(await Vip.getVipList());
});
router.post("/vips/update", authenticate, requirePermission(Permission.MANAGE_VIPS), async (req: AuthenticatedRequest, res) => {
  try {
    await Vip.update(req.body, req.user.username);
    res.sendStatus(200);
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
router.post("/vips/create", authenticate, requirePermission(Permission.MANAGE_VIPS), async (req: AuthenticatedRequest, res) => {
  try {
    res.status(200).json(await Vip.create(req.body, req.user.username));
  } catch (e) {
    console.error(e);
    res.sendStatus(500);
  }
});
router.post("/vips/delete", authenticate, requirePermission(Permission.MANAGE_VIPS), async (req: AuthenticatedRequest, res) => {
  try {
    await Vip.delete(req.body, req.user.username);
    res.sendStatus(200);
  } catch (e) {
    res.sendStatus(500);
  }
});
router.post("/chatlogs", authenticate, requirePermission(Permission.VIEW_CHATLOGS), async (req: AuthenticatedRequest, res) => {
  const { players } = req.body;
  if (!players) return res.sendStatus(500);
  try {
    res.status(200).json(await Chatlog.getChatlogs({ players: players }));
  } catch (e) {
    res.sendStatus(500);
  }
});

export default router;
