console.log('Starting...');

const Discord = require('discord.js');
const fs = require('fs');
const defaultSettings = require("./Settings/default.json");

fs.readFileSync('./Logs/startCount.log', (err, data) => {
  if(err) return console.error(err);
  let fileContent = parseInt(data) + 1
  fs.writeFile('./Logs/startCount.log', fileContent.toString(), err => console.error(err));
});

const client = new Discord.Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  intents: 32767,
});

fs.rmSync('./Logs/debug.log', { force: true });
client.on('debug', debug => fs.appendFileSync('./Logs/debug.log', debug + `\n`));

client.owner = defaultSettings.ownerID;
client.prefix = defaultSettings.prefix;
client.slashCommandList = [];
client.functions = {};
client.guildWhitelist = (fs.readFileSync('./Database/guildWhitelist.db')).toString().split(' ');
client.aliases = new Discord.Collection();
client.events = new Discord.Collection();
client.cooldown = new Discord.Collection();
client.commands = new Discord.Collection();
client.categories = fs.readdirSync("./Commands/");
client.keys = require('./Settings/keys.js');

module.exports = client;

fs.readdirSync('./Handlers')
  .filter(file => file.endsWith("_handler.js"))
  .forEach(handler => {
    require(`./Handlers/${handler}`)(client);
  });

client.login(client.keys.token)
  .then(console.log('Logged in'));

process.on('exit', _ => {
  client.destroy();
});