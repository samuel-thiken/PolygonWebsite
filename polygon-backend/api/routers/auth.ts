import express, { Request } from "express";
import User from "../../models/User";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import Role, { Permission } from "../../models/Role";

const router = express.Router();

export type AuthenticatedRequest = Request & { user: User };

export const authenticate = async (req: Request & { user?: User }, res, next) => {
  const token = req.body.token || req.query.token || req.headers["x-access-token"];

  if (!token) return res.status(403).send("A token is required for authentication");
  try {
    const decoded = jwt.verify(token, process.env.JWT_TOKEN) as { username: string };
    req.user = await User.getUserByName(decoded.username);
    if (!req.user) return res.status(401).send("Invalid Token");
  } catch (err) {
    return res.status(401).send("Invalid Token");
  }
  return next();
};
export const requirePermission = (permission: Permission) => async (req: Request & { user?: User }, res, next) => {
  try {
    const user: User = req.user;
    const role: Role = await user.getRole();
    if (role && (await role.asPermission(permission))) return next();
    else return res.status(401).send("Permission denied");
  } catch (err) {
    return res.status(401).send("Permission denied");
  }
};
export const requireApiKey = (req: Request & { user?: User }, res, next) => {
  const apiKeys = process.env.API_KEYS.split(";");
  const apiKey = req.headers["x-api-key"] as string;

  if (apiKey && apiKeys.includes(apiKey)) return next();
  
  return res.status(401).send("Permission denied");
};

router.post("/login", async (req, res) => {
  try {
    // Get user input
    const { username, password } = req.body;

    // Validate user input
    if (!(username && password)) res.status(400).send("All input is required");

    const dbUser = await User.getUserByName(username);
    if (dbUser && (await bcrypt.compare(password, dbUser.password))) {
      // Create jwt token
      const token = jwt.sign({ username: dbUser.username }, process.env.JWT_TOKEN, {
        expiresIn: "30d"
      });
      // Authentication successful
      return res.status(200).json({
        username: dbUser.username,
        token: token
      });
    }
    // Authentication failed
    res.status(400).send("Invalid Credentials");
  } catch (e) {
    console.error(e);
  }
});

export default router;
