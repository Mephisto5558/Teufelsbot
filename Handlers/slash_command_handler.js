const
  { readdirSync } = require('fs'),
  { REST } = require('@discordjs/rest'),
  errorColor = require('chalk').bold.red,
  event = require('../Events/interactionCreate.js'),
  invalidEntries = [
    'id', 'run', 'beta', 'usage', 'aliases', 'version', 'category', 'cooldowns', 'permissions', 'slashCommand', 'prefixCommand',
    'dm_permission', 'application_id', 'default_permission', 'default_permissions', 'default_member_permissions', 'type'
  ];

let
  commands = [],
  skipCommandList = [],
  clientCommands = [],
  clientCommandList = [];

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

function format(command) {
  return Object.fromEntries(Object.entries(command)
    .filter(([a]) => !invalidEntries.includes(a))
    .sort((a, b) => a.toString().localeCompare(b.toString()))
  )
}

module.exports = async (client, guildForForceSync) => {
  clientCommands = await rest.get(`/applications/${client.userID}/commands`);
  const rest = new REST().setToken(client.keys.token);

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

  for (let command of commands) {
    let same = false;
    command = format(command);

    if (!guildForForceSync) {
      for (const clientCommand of clientCommands) {
        same = command == format(clientCommand);
        if(same) {
          skipCommandList.push(command);
          break;
        }
      }
    }

    if(same) continue;

    clientCommandList.push(command);
    clientCommands = clientCommands.filter(entry => entry.name != command.name);
  }

  clientCommandList = clientCommandList.filter(entry => !clientCommands.map(e => e.name).includes(entry.name));

  try {
    await rest.put(`/applications/${client.userID}/commands`, { body: clientCommandList.toJSON() })
    client.log(`Registered ${clientCommandList.length} Commands: ${clientCommandList.map(a => a.name).join(', ')}`);
  }
  catch (err) { console.error(err) }

  client.log(`Skipped ${skipCommandList.length} Commands: ${skipCommandList.map(a => a.name).join(', ')}`)

  client.on('interactionCreate', event.bind(null, client));
  client.log(`Loaded Event interactionCreate`);
  client.log(`Ready to receive slash commands\n`);

  if (guildForForceSync) return;

  while (!client.isReady()) await client.functions.sleep(100);

  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users.\n`);
  console.timeEnd('Starting time');
}