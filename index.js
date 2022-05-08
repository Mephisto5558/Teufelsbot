console.log('Starting...');

const
  { Client, Collection } = require('discord.js'),
  fs = require('fs'),
  defaultSettings = require("./Settings/default.json"),
  
  client = new Client({
    partials: ["MESSAGE", "CHANNEL", "REACTION"],
    intents: 32767,
  });

client.owner = defaultSettings.ownerID;
client.prefix = defaultSettings.prefix;
client.functions = {};
client.startTime = Date.now();
client.categories = fs.readdirSync('./Commands/');
client.keys = require('./Settings/keys.js');
client.guildWhitelist = (fs.readFileSync('./Database/guildWhitelist.db')).toString().split(' ');
client.aliases = new Collection();
client.events = new Collection();
client.cooldown = new Collection();
client.commands = new Collection();
client.slashCommands = new Collection();
client.log = function log(...data) {
  let date = new Date().toLocaleString('en-GB', {
    hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit'
  });
  console.log(`[${date}] ${data}`)
};

//module.exports = client;

fs.readdirSync('./Handlers')
  .filter(file => file.endsWith('_handler.js'))
  .forEach(handler => {
    require(`./Handlers/${handler}`)(client);
  });

client.login(client.keys.token)
  .then(client.log('Logged in'));

process.on('exit', _ => {
  client.destroy();
});