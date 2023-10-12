import cors from "cors";
import express from "express";
import cookieParser from 'cookie-parser';
import session from "express-session";
import uniqid from "uniqid";
import VoteUtils from "./VoteUtils";

// Routers
import authRouter from "./routers/auth";
import userRouter from "./routers/users";
import voteRouter from "./routers/vote";
import leaderboardRouter from "./routers/leaderboard";
import statsRouter from "./routers/stats";
import databaseRouter from "./routers/database";

const app = express();
const useCors = cors({
  credentials: true,
  origin: process.env.CLIENT_SIDE_HOST
});
const disabledCors = cors({
  credentials: true,
  origin: true
});
// app.use(cors({
//   credentials: true,
//   origin: process.env.CLIENT_SIDE_HOST
// }));
app.use(express.json());
app.use(cookieParser());
// TODO change secret
app.use(
    session({
        genid: () => uniqid(),
        secret: "secret", 
        resave: false,
        saveUninitialized: true
    })
);

app.use("/auth", useCors, authRouter);
app.use("/users", useCors, userRouter);
app.use("/vote", useCors, voteRouter);
app.use("/leaderboard", useCors, leaderboardRouter);
app.use("/stats", useCors, statsRouter);
app.use("/database", disabledCors, databaseRouter);

export const start = () => {
  app.listen(parseInt(process.env.HTTP_SERVER_PORT as string), process.env.HTTP_SERVER_HOST as string, () => {
    console.log(`Server listening`);
  });
  VoteUtils.getInstance().init();
};
