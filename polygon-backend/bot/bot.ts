import { Client, EmbedBuilder, GatewayIntentBits, TextChannel } from "discord.js";
import VoteUtils from "../api/VoteUtils";
import Leaderboard from "../models/Leaderboard";
import PlayerCountTracker, { PlayerCount } from "../utils/PlayerCountTracker";
const client = new Client({ intents: [GatewayIntentBits.Guilds] });

async function sendVoteRemember() {
  try {
    const channel = (await client.channels.fetch(process.env.DISCORD_CHANNEL_VOTE_REMEMBER)) as TextChannel;
    const embedBuilder = new EmbedBuilder();
    embedBuilder.setTitle("New vote!");
    embedBuilder.setDescription("A new vote just started! \nYou can now choose next week's maps \n\nhttps://polygon-bf.com/vote");
    embedBuilder.setFooter({
      text: "The Polygon Staff"
    });
    channel.send({
      embeds: [embedBuilder.toJSON()]
    });
  } catch (e) {
    console.error(`Vote remember channel (${process.env.DISCORD_CHANNEL_VOTE_REMEMBER}) couldn't be fetched`);
  }
}
function kFormatter(num) {
  return "" + (num / 1000000).toFixed(2) + " M";
}
 
async function updateLeaderboard() {
  try {
    const channel = (await client.channels.fetch(process.env.DISCORD_LEADERBOARD_CHANNEL)) as TextChannel;
    const message = await channel.messages.fetch(process.env.DISCORD_LEADERBOARD_MESSAGE);
    const leaderboard = await Leaderboard.getTop10Kills();
    const embedBuilder = new EmbedBuilder();
    embedBuilder.setTitle("Leaderboard");
    embedBuilder.setDescription("Server leaderboard based on kill count");
    embedBuilder.setFooter({
      text: "The Polygon Staff"
    });
    embedBuilder.addFields(leaderboard.map((player, i) => ({ name: `${i + 1} - ${player.SoldierName}`, value: "Score: **" + kFormatter(player.Score) + "**, Kills: **" + player.Kills + "**, Deaths: **" + player.Deaths + "**, KDR: **" + (player.Kills / player.Deaths).toFixed(2) + "**"})));
    message.edit({
      embeds: [embedBuilder.toJSON()]
    });
  } catch (e) {
    console.error(`Leaderboard message (${process.env.DISCORD_LEADERBOARD_MESSAGE}) couldn't be fetched`);
  }
}

client.on("ready", () => {
  console.log(`Discord bot logged in as ${client.user.tag}!`);
  
  updateLeaderboard();
  setInterval(updateLeaderboard, 1 * 60 * 60 * 1000);
});

export const start = () => {
  if (PlayerCountTracker.getInstance()) {
    PlayerCountTracker.getInstance().on("playercountchanges", (playercount: PlayerCount) => {
      const status = `${playercount.mapname} : ${playercount.playing}/${playercount.total} (${playercount.queue})`.replace("(0)", "");
      client.user.setActivity(status);
    });
  }
  VoteUtils.getInstance().on("newvote", async () => {
    sendVoteRemember();
  });

  client.login(process.env.DISCORD_SECRET);
};
