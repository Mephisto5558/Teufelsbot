console.log('Starting...')

const express = require("express");
const Discord = require("discord.js");
const fs = require("fs");

const app = express();
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: 32767,
});

client.owner = '691550551825055775';
client.userID = '948978571802710047';
client.prefix = '.';
client.slashCommandList = [];
client.functions = {};
client.workStats = {messages: [], interactions: []};
client.guildWhitelist = (fs.readFileSync('./Database/guildWhitelist.db')).toString().split(' ');
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldowns = new Discord.Collection();
client.commands = new Discord.Collection();
client.categories = fs.readdirSync("./Commands/");

module.exports = client;

fs.readdirSync("./Handlers").filter((file) => file.endsWith("_handler.js")).forEach((handler) => {
  require(`./Handlers/${handler}`)(client);
});

//client.on('debug', console.log);
client.login(process.env.token);

app.listen(1000, () => { console.log("Website is online") })
app.get("/", (req, res) => { res.send("Hello world!") })

process.on('exit', () => {
  client.destroy();
});