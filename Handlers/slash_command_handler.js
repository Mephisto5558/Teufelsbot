const
  { readdirSync } = require('fs'),
  { Collection } = require('discord.js'),
  errorColor = require('chalk').bold.red,
  event = require('../Events/interactionCreate.js'),
  invalidEntries = [
    'id', 'run', 'beta', 'usage', 'aliases', 'version', 'category', 'cooldowns', 'permissions', 'slashCommand', 'prefixCommand',
    'dm_permission', 'application_id', 'default_permission', 'default_permissions', 'default_member_permissions', 'type'
  ];

let skipCommandList = [];

function work(option) {
  if (Array.isArray(option.options)) for (let subOption of option.options) subOption = work(subOption);

  if (option.type) {
    option.type = parseInt(option.type.toString()
      .replace('SUB_COMMAND_GROUP', 2).replace('SUB_COMMAND', 1)
      .replace('STRING', 3).replace('INTEGER', 4)
      .replace('BOOLEAN', 5).replace('USER', 6)
      .replace('CHANNEL', 7).replace('ROLE', 8)
      .replace('MENTIONABLE', 9).replace('NUMBER', 10)
      .replace('ATTACHMENT', 11)
    )
  }
  else {
    console.log(errorColor(`${option.name}: options.type IS MISSING! Fixing.`));
    option.type = 1;
  }

  if (/[A-Z]/.test(option.name)) {
    console.log(errorColor(`${option.name} IS UPPERCASE! UPPERCASE IS INVALID! Fixing.`));
    option.name = option.name.toLowerCase();
  }

  return option;
}

function format(command) {
  return Object.fromEntries(Object.entries(command)
    .filter(([a]) => !invalidEntries.includes(a))
    .sort((a, b) => a.toString().localeCompare(b.toString()))
  )
}

module.exports = async (client, SyncGuild) => {
  await client.ready();

  if (!SyncGuild || SyncGuild == '*') {
    const commands = [];

    for (const subFolder of getDirectoriesSync('./Commands')) {
      for (const file of readdirSync(`./Commands/${subFolder}`).filter(file => file.endsWith('.js'))) {
        let same = false;
        let command = require(`../Commands/${subFolder}/${file}`);

        if (!command.slashCommand || command.disabled || (client.botType == 'dev' && !command.beta)) continue;
        const formatedCommand = format(command);

        if(command.options) for (let option of command.options) option = work(option);

        for (const clientCommand of client.application.commands.cache.map(e => format(e))) {
          same = formatedCommand == clientCommand;
          if (same) {
            skipCommandList.push(command);
            break;
          }
        }

        if (!same) commands.push(command);
      }
    }

    client.slashCommands = new Collection(commands.map(e => [e.name, e]));
    for (const guild of await client.guilds.fetch()) await client.application.commands.set([], guild[0]);
  }

  for (const command of client.slashCommands) await client.application.commands.create(command[1], SyncGuild && SyncGuild != '*' ? SyncGuild : null);

  if (SyncGuild) return;

  client.log(`Registered ${client.slashCommands.size} Commands: ${client.slashCommands.map(a => a.name).join(', ')}`);
  client.log(`Skipped ${skipCommandList.length} Commands: ${skipCommandList.map(a => a.name).join(', ')}`)

  client.on('interactionCreate', event.bind(null, client));
  client.log('Loaded Event interactionCreate');
  client.log('Ready to receive slash commands\n');

  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.map(g => g.memberCount).reduce((a, b) => a + b)} users.\n`);
  console.timeEnd('Starting time');
}