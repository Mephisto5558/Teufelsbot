console.time('Starting time')
console.log('Starting...');

const
  { Client, Collection } = require('discord.js'),
  fs = require('fs');

const client = new Client({
  partials: ["MESSAGE", "CHANNEL", "REACTION"],
  allowedMentions: { parse: ['users', 'roles'] },
  shards: 'auto',
  intents: 32767
});

let defaultSettings = require("./env.json");
defaultSettings = Object.assign({}, defaultSettings.global, defaultSettings[defaultSettings.global.environment]);

client.owner = defaultSettings.botOwnerID;
client.userID = defaultSettings.botUserID;
client.botType = defaultSettings.type;
client.prefix = defaultSettings.prefix;
client.functions = {};
client.startTime = Date.now();
client.categories = fs.readdirSync('./Commands/');
client.keys = Object.assign({}, defaultSettings.keys, { token: defaultSettings.token });
client.guildWhitelist = (fs.readFileSync('./Database/guildWhitelist.db')).toString().split(' ');
client.aliases = new Collection();
client.events = new Collection();
client.cooldown = new Collection();
client.commands = new Collection();
client.slashCommands = new Collection();
client.log = function log(...data) {
  let date = new Date().toLocaleString('en-GB', {
    hour12: false,
    hour:   '2-digit',
    minute: '2-digit',
    second: '2-digit'
  });
  console.log(`[${date}] ${data}`)
};

fs.readdirSync('./Handlers').forEach(handler => {
  require(`./Handlers/${handler}`)(client);
});

client.login(client.keys.token)
  .then(client.log(`Logged into ${client.botType}`));

process.on('exit', _ => {
  client.destroy();
}) 