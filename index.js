console.log('Starting...')

'use strict';
const express = require("express");
const Discord = require("discord.js");
const fs = require("fs");

fs.rmSync('./Logs/debug.log', {force: true});

const app = express();
const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: 32767,
});

client.on('debug', debug => fs.appendFileSync('./Logs/debug.log', debug + `\n`));

client.owner = '691550551825055775';
client.userID = '948978571802710047';
client.prefix = '.';
client.slashCommandList = [];
client.functions = {};
client.guildWhitelist = (fs.readFileSync('./Database/guildWhitelist.db')).toString().split(' ');
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldown = new Discord.Collection();
client.commands = new Discord.Collection();
client.categories = fs.readdirSync("./Commands/");

module.exports = client;

fs.readdirSync("./Handlers").filter((file) => file.endsWith("_handler.js")).forEach((handler) => {
  require(`./Handlers/${handler}`)(client);
});

client.login(process.env.token)
  .then(console.log('Logged in'));

app.listen(1000, () => { console.log("Website is online") })
app.get("/", (req, res) => { res.send("Hello world!") })
app.use('/website.ico', express.static('./website.ico'));

process.on('exit', () => {
  client.destroy();
});