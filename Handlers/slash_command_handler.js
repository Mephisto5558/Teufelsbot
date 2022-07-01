const
  { readdirSync } = require('fs'),
  { Client } = require('discord-slash-commands-client'),
  errorColor = require('chalk').bold.red,
  event = require('../Events/interactionCreate.js');

let
  commandCount = 0,
  delCommandCount = 0,
  skipCommandCount = 0,
  commands = [],
  clientCommands = [];

function work(option) {
  if (Array.isArray(option.options))
    for (const subOption of option.options) work(subOption);

  if (!option.type) {
    console.log(errorColor(`options.type IS MISSING! Fixing.`))
    return option.type = 1;
  }

  if (/[A-Z]/.test(option.name)) {
    console.log(errorColor(`${option.name} IS UPPERCASE! UPPERCASE IS INVALID! Fixing.`))
    option.name = option.name.toLowerCase();
  }

  option.type = option.type.toString()
    .replace('SUB_COMMAND_GROUP', 2).replace('SUB_COMMAND', 1)
    .replace('STRING', 3).replace('INTEGER', 4)
    .replace('BOOLEAN', 5).replace('USER', 6)
    .replace('CHANNEL', 7).replace('ROLE', 8)
    .replace('MENTIONABLE', 9).replace('NUMBER', 10)
    .replace('ATTACHMENT', 11)
}

async function compareCommands(input) {
  output = formatOptions(input);
  for (let i = 0; i < output.length; i++) {
    output[i] = JSON.stringify(output[i])
      .replace(/([0-9]+)([^"0-9"])/g, '"$1"$2');
  }

  return output[0] == output[1];
}

function formatOptions(input) {
  let output = [];

  for (const entry of input) {
    output.push({
      name: entry.name,
      description: entry.description,
      required: entry.required || false,
      choices: entry.choices || false,
      options: entry.options ? formatOptions(entry.options) : false
    })
  }

  return output;
}

module.exports = async (client, guildForForceSync) => {
  const commandClient = new Client(client.keys.token, client.userID);

  clientCommands = await commandClient.getCommands({});

  if (!guildForForceSync) {
    for (const subFolder of readdirSync('./Commands')) {
      for (const file of readdirSync(`./Commands/${subFolder}`).filter(file => file.endsWith('.js'))) {

        let command = require(`../Commands/${subFolder}/${file}`);
        if (!command.slashCommand || command.disabled || (client.botType == 'dev' && !command.beta)) continue;

        if (Array.isArray(command.options))
          for (const option of command.options) work(option);
        else if (command.options) work(commandOption.options);

        commands.push(command);
        client.slashCommands.set(command.name, command);
      }
    }
  }

  for (const command of commands) {
    let same = false;

    if (!guildForForceSync) {
      for (const clientCommand of clientCommands) {
        same = await compareCommands([command, clientCommand]);
        if (same) {
          client.log(`Skipped Registration of Slash Command ${command.name}`);
          skipCommandCount++;
          break;
        }
      }
    }

    clientCommands = clientCommands.filter(entry => entry.name != command.name);

    if (same) continue;
    if (commandCount && commands[commandCount + 1])
      await client.functions.sleep(10000);

    try {
      await commandClient.createCommand({
        name: command.name,
        description: command.description,
        options: command.options
      }, guildForForceSync?.id);

      client.log(`Registered Slash Command ${command.name}${guildForForceSync ? ` for guild ${guildForForceSync.id}` : ''}`);
      commandCount++
    }
    catch (err) {
      console.error(errorColor('[Error Handling] :: Unhandled Slash Handler Error/Catch'));
      console.error(err);
      if (err.response?.data.errors)
        console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
    }
  }

  for (const clientCommand of clientCommands) {
    try {
      await commandClient.deleteCommand(clientCommand.id);
      client.log(`Deleted Slash Command ${clientCommand.name}`);
      delCommandCount++
    }
    catch (err) {
      console.error(errorColor('[Error Handling] :: Unhandled Slash Command Handler Error/Catch'));
      console.error(err);
      if (err.response.data.errors)
        console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
    }

    if (clientCommands[delCommandCount + 1]) await client.functions.sleep(10000);
  }

  client.log(`Registered ${commandCount} Slash commands`);
  client.log(`Skipped ${skipCommandCount} Slash Commands`);
  client.log(`Deleted ${delCommandCount} Slash commands\n`);

  client.on('interactionCreate', event.bind(null, client));
  client.log(`Loaded Event interactionCreate`);
  client.log(`Ready to receive slash commands\n`);

  if (guildForForceSync) return;

  while (!client.isReady()) await client.functions.sleep(100);

  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users.\n`);
  console.timeEnd('Starting time');
}