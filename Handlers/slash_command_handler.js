const fs = require('fs');
const { Client } = require("discord-slash-commands-client");
const chalk = require("chalk");
const errorColor = chalk.bold.red;

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
  await client.functions.sleep(1000);
  const commandClient = new Client(
    client.keys.token,
    require('../Settings/default.json').userID
  );
  
  await fs.readdirSync('./Commands').forEach(subFolder => {
    fs.readdirSync(`./Commands/${subFolder}/`).filter(file => file.endsWith(".js")).forEach(file => {
      let command = require(`../Commands/${subFolder}/${file}`);
      if (!command.slashCommand || command.disabled) return;
      
      if(Array.isArray(command.options)) 
        command.options.forEach(option => { work(option) });
      else if(command.options)
        for (commandOption of command.options) { work(commandOption.options) };
      commands.push(command)
    })
  });
  
  for (let command of commands) {
    await commandClient.createCommand({
      name: command.name,
      description: command.description,
        options: command.options
    })
    .then(_ => {
      console.log(`Registered Slash Command ${command.name}`);
      commandCount++
    })
    .catch(err => {
      console.error(errorColor('[Error Handling] :: Unhandled Slash Handler Error/Catch'));
      console.error(err);
      if(err.response.data)
        console.error(err.response.data.errors.options[0].description)
    });
    await client.functions.sleep(10000);
  };
  
  console.log(`Loaded ${commandCount} Slash commands\n`);
  
};