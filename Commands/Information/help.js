const
  { Command } = require('reconlx'),
  { EmbedBuilder } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

function listCommands(list, output, count, category) {
  for (let command of list) {
    command = command[1];

    if (command.category.toUpperCase() != category?.toUpperCase() || command.hideInHelp || command.disabled || output.includes(`\`${command.name}\``)) continue;

    if (count % 5 == 0) output += `\`${command.name}\`\n> `
    else output += `\`${command.name}\`, `
    count++
  }
  return [output, count];
}

module.exports = new Command({
  name: 'help',
  aliases: { prefix: [], slash: [] },
  description: 'Shows all bot commands',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 0, user: 50 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [{
    name: 'command',
    description: 'Type a command here to get more information about it',
    type: 'String',
    required: false
  }],

  run: (client, message, interaction) => {
    const embed = new EmbedBuilder({ color: colors.discord.BURPLE });
    let query;

    if (message) query = message.args[0]?.toLowerCase();
    else {
      message = interaction;
      query = interaction.options?.getString('command')?.toLowerCase();
    }

    if (query) {
      const cmd = client.commands.get(query) || client.slashCommands.get(query);

      if (!cmd?.name || cmd.hideInHelp || cmd.disabled || cmd.category.toLowerCase() == 'owner-only') {
        embed.description = `No Information found for command \`${query}\``;
        embed.color = colors.RED;
      }
      else {
        embed.title = `Detailed Information about: \`${cmd.name}\``;
        embed.description = cmd.description ?? 'No description found';
        embed.footer = { text: `Syntax: <> = required, [] = optional | Prefix: '${client.db.get('settings')[message.guild.id]?.config?.prefix || client.db.get('settings').default.config.prefix}'` };
        embed.fields = [
          cmd.aliases?.prefix?.length ? { name: 'Prefix Command Aliases', value: `\`${listCommands(cmd.aliases.prefix, '', 1)[0].replace(/> /g, '')}\``, inline: true } : null,
          cmd.aliases?.slash?.length ? { name: 'Slash Command Aliases', value: `\`${listCommands(cmd.aliases.slash, '', 1)[0].replace(/> /g, '')}\``, inline: true } : null,
          cmd.permissions?.client?.length ? { name: 'Required Bot Permissions', value: '`' + cmd.permissions.client.join('`, `'), inline: false } : null,
          cmd.permissions?.user?.length ? { name: 'Required User Permissions', value: '`' + cmd.permissions.user.join('`, `'), inline: true } : null,
          cmd.cooldowns?.guild || cmd.cooldowns?.user ? { name: 'Command Cooldowns', value: `Guild: \`${parseFloat((cmd.cooldowns.guild / 1000).toFixed(2))}\`s, User:\`${parseFloat((cmd.cooldowns.user / 1000).toFixed(2))}\``, inline: false } : null,
          cmd.usage ? { name: 'Usage', value: `${cmd.slashCommand ? 'SLASH Command: look at the option descriptions.\n' : ''} ${cmd.usage || ''}`, inline: false } : null
        ].filter(e => e);
      }

      return interaction ? interaction.editReply({ embeds: [embed] }) : client.functions.reply({ embeds: [embed] }, message);
    }

    embed.title = `🔰All my commands`;
    embed.setThumbnail(client.user.displayAvatarURL());

    for (let i = 0; i < client.categories.length; i++) {
      const category = client.categories[i].toLowerCase();
      if (category == 'owner-only') continue;

      let data = listCommands(client.commands, '', 1, category);
      data = listCommands(client.slashCommands, data[0], data[1], category);

      if (data[1] == 1) continue;

      let cmdList = data[0];

      if (cmdList.endsWith('\n> ')) cmdList = cmdList.slice(0, -4);
      if (cmdList.endsWith(', ')) cmdList = cmdList.slice(0, -2);
      if (!cmdList.endsWith('`')) cmdList += '`';

      if (cmdList) embed.addFields([{ name: `**${category} [${data[1] - 1}]**`, value: `> ${cmdList}\n`, inline: true }]);
    }

    if (!embed.fields) embed.description = 'No commands found...';
    else embed.footer = { text: `Use the 'command' option to get more information about a specific command.` };

    interaction ? interaction.editReply({ embeds: [embed] }) : client.functions.reply({ embeds: [embed] }, message);
  }
})