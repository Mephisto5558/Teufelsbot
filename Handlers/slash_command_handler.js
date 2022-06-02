const
  fs = require('fs'),
  { Client } = require('discord-slash-commands-client'),
  chalk = require('chalk'),
  event = require('../Events/interactionCreate.js'),
  errorColor = chalk.bold.red;

let
  commandCount = 0,
  delCommandCount = 0,
  skipCommandCount = 0,
  commands = [],
  clientCommands = [];

function work(option) {
  if(Array.isArray(option.options))
    option.options.forEach(option => { work(option) });

  if(!option.type) return option.type = 1
  
  if(/[A-Z]/.test(option.name)) {
    console.log(errorColor(`${option.name} IS UPPERCASE! UPPERCASE IS INVALID! Fixing.`))
    option.name = option.name.toLowerCase();
  };

  option.type = option.type.toString()
    .replace('SUB_COMMAND_GROUP', 2).replace('SUB_COMMAND', 1)
    .replace('STRING', 3).replace('INTEGER', 4)
    .replace('BOOLEAN', 5).replace('USER', 6)
    .replace('CHANNEL', 7).replace('ROLE', 8)
    .replace('MENTIONABLE', 9).replace('NUMBER', 10)
    .replace('ATTACHMENT', 11)
};

function compareCommands(input1, input2) {
  let output = [];
  let input = [input1, input2];

  for(let i = 0; i < input.length; i++) {
    let data = input[i];

    output[i] = {
      name: data.name,
      description: data.description,
      required: data.required || false,
      choices: data.choices || false
    }
    if(data.options) output[i].options = formatOptions(data.options);
    output[i] = JSON.stringify(output[i]) //replaces <NUMBER> with <"NUMBER">
  }
  if (output[0] == output[1]) return true;
  else {
    for(let entry of output) entry.replace(/([0-9]+)([^"0-9"])/g, '"$1"$2');
    return output[0] == output[1];
  }
}

function formatOptions(input) {
  let output = [];
  for(let i = 0; i < input?.length; i++) {
    let data = input[i];

    output[i] = {
      name: data.name,
      description: data.description,
      required: data.required || false,
      choices: data.choices || false
    }
    if(data.options) output[i].options = formatOptions(data.options);
  }
  return output;
}

module.exports = async (client, guildForForceSync) => {
  const commandClient = new Client(
    client.keys.token,
    client.userID
  );
  let same = false;

  clientCommands = await commandClient.getCommands({});

  if(guildForForceSync) {
    for(let clientCommand of clientCommands) {
      await commandClient.deleteCommand(clientCommand.id, guildForForceSync.id);
      await client.functions.sleep(10000);
    }
  }

  fs.readdirSync('./Commands').forEach(subFolder => {
    fs.readdirSync(`./Commands/${subFolder}/`).filter(file => file.endsWith('.js')).forEach(file => {

      let command = require(`../Commands/${subFolder}/${file}`);
      if(!command.slashCommand || command.disabled || (client.botType == 'dev' && !command.beta)) return;

      if(Array.isArray(command.options))
        command.options.forEach(option => { work(option) });
      else if(command.options) work(commandOption.options);
      commands.push(command)
      client.slashCommands.set(command.name, command)

    })
  });

  for(let command of commands) {
    if(!guildForForceSync) {
      for(let clientCommand of clientCommands) {
        same = compareCommands(command, clientCommand);
        if(same) {
          client.log(`Skipped Registration of Slash Command ${command.name}`);
          skipCommandCount++;
          break;
        }
      }
    }

    clientCommands = clientCommands.filter(entry => entry.name != command.name);
    if(same) continue;
    if(commandCount != 0 && commands[commandCount + 1])
      await client.functions.sleep(10000);

    await commandClient.createCommand(
      {
        name: command.name,
        description: command.description,
        options: command.options
      },
      guildForForceSync?.id
    )
    .then(_ => {
      client.log(`Registered Slash Command ${command.name}`);
      commandCount++
    })
    .catch(err => {
      console.error(errorColor('[Error Handling] :: Unhandled Slash Handler Error/Catch'));
      console.error(err);
      if(err.response?.data.errors)
        console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
    })
  }

  for(let clientCommand of clientCommands) {
    await commandClient.deleteCommand(clientCommand.id)
    .then(_ => {
      client.log(`Deleted Slash Command ${clientCommand.name}`);
      delCommandCount++
    })
    .catch(err => {
      console.error(errorColor('[Error Handling] :: Unhandled Slash Command Handler Error/Catch'));
      console.error(err);
      if(err.response.data.errors)
        console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
    });

    if(clientCommands[delCommandCount + 1]) await client.functions.sleep(10000);
  }
  
  client.log(`Loaded ${commandCount} Slash commands`);
  client.log(`Skipped ${skipCommandCount} Slash Commands`);
  client.log(`Deleted ${delCommandCount} Slash commands\n`);

  client.on('interactionCreate', event.bind(null, client))
  client.log(`Loaded Event interactionCreate`);
  client.log(`Ready to receive slash commands\n`);

  if(guildForForceSync) return;
  
  do {
    await client.functions.sleep(100);
  } while(!client.readyAt)
  
  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.map(g => g.memberCount).reduce((a, c) => a + c)} users.\n`);
  console.timeEnd('Starting time');
}