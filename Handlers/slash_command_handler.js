const
  fs = require('fs'),
  { Client } = require("discord-slash-commands-client"),
  chalk = require("chalk"),
  errorColor = chalk.bold.red;

let commandCount = 0;
let commands = [];
  
function work(option) {
  if(!option.type) option.type = 1
  else option.type = option.type.toString()
    .replace('SUB_COMMAND', 1).replace('SUB_COMMAND_GROUP', 2)
    .replace('STRING', 3).replace('INTEGER', 4)
    .replace('BOOLEAN', 5).replace('USER', 6)
    .replace('CHANNEL', 7).replace('ROLE', 8)
    .replace('MENTIONABLE', 9).replace('NUMBER', 10)
    .replace('ATTACHMENT', 11)
};


module.exports = async client => {
  const commandClient = new Client(
    client.keys.token,
    require('../Settings/default.json').userID
  );
  
  await fs.readdirSync('./Commands').forEach(subFolder => {
    fs.readdirSync(`./Commands/${subFolder}/`).filter(file => file.endsWith('.js')).forEach(file => {
      let command = require(`../Commands/${subFolder}/${file}`);
      if (!command.slashCommand || command.disabled) return;
      
      if(Array.isArray(command.options)) 
        command.options.forEach(option => { work(option) });
      else if(command.options)
        for (let commandOption of command.options) { work(commandOption.options) };
      commands.push(command)
      client.slashCommands.set(command.name, command)
    })
  });
  
  for (let command of commands) {
    await commandClient.createCommand({
      name: command.name,
      description: command.description,
      options: command.options
    })
    .then(_ => {
      client.log(`Registered Slash Command ${command.name}`);
      commandCount++
    })
    .catch(err => {
      console.error(errorColor('[Error Handling] :: Unhandled Slash Handler Error/Catch'));
      console.error(err);
      if(err.response.data.errors)
        console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
    });
    await client.functions.sleep(10000);
  };
  
  client.log(`Loaded ${commandCount} Slash commands\n`);

  
  const eventName = 'interactionCreate';
  const event = require(`../Events/${eventName}.js`);

  client.on(eventName, event.bind(null, client));
  client.log(`Loaded Event ${eventName}`);
  client.log(`Ready to reveive slash commands\n`);
  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.map(g => g.memberCount).reduce((a, c) => a + c)} users.\n`);
};