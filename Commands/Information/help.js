const
  { EmbedBuilder, Colors } = require('discord.js'),
  I18nProvider = require('../../Functions/private/I18nProvider.js');

function listCommands(list, output, count, category) {
  for (const command of list.values()) {
    if (command.category?.toLowerCase() != category?.toLowerCase() || command.hideInHelp || command.disabled || output.includes(`\`${command.name}\``)) continue;

    if (count % 5 == 0) output += `\`${command.name}\`\n> `
    else output += `\`${command.name}\`, `
    count++
  }
  return [output, count];
}

module.exports = {
  name: 'help',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 50 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  ephemeralDefer: true,
  options: [{ name: 'command', type: 'String' }],

  run: (message, lang, client) => {
    const
      embed = new EmbedBuilder({ color: Colors.Blurple }),
      query = (message.args?.[0] || message.options?.getString('command'))?.toLowerCase();

    if (query) {
      const cmd = client.commands.get(query) || client.slashCommands.get(query);

      if (!cmd?.name || cmd.hideInHelp || cmd.disabled || cmd.category.toLowerCase() == 'owner-only') {
        embed.data.description = lang('one.notFound', query);
        embed.data.color = Colors.Red;
      }
      else {
        const helpLang = I18nProvider.__.bind(I18nProvider, { undefinedNotFound: true, locale: client.db.get('guildSettings')[message.guild.id]?.lang || message.guild.preferredLocale.slice(0, 2), backupPath: `commands.${cmd.category.toLowerCase()}.${cmd.name}` });

        embed.data.title = lang('one.embedTitle', cmd.name);
        embed.data.description = helpLang('description') ?? lang('one.noDescription');
        if (cmd.usage) embed.data.footer = { text: lang('one.embedFooterText', client.db.get('guildSettings')[message.guild.id]?.config?.prefix || client.db.get('guildSettings').default.config.prefix) };
        embed.data.fields = [
          cmd.aliases?.prefix?.length ? { name: lang('one.prefixAlias'), value: `\`${listCommands(cmd.aliases.prefix, '', 1)[0].replaceAll('> ', '')}\``, inline: true } : null,
          cmd.aliases?.slash?.length ? { name: lang('one.slashAlias'), value: `\`${listCommands(cmd.aliases.slash, '', 1)[0].replaceAll('> ', '')}\``, inline: true } : null,
          cmd.permissions?.client?.length ? { name: lang('one.botPerms'), value: `\`${cmd.permissions.client.join('`, `')}\``, inline: false } : null,
          cmd.permissions?.user?.length ? { name: lang('one.userPerms'), value: `\`${cmd.permissions.user.join('`, `')}\``, inline: true } : null,
          cmd.cooldowns?.guild || cmd.cooldowns?.user ? {
            name: lang('one.cooldowns'), inline: false, value:
              (cmd.cooldowns.guild ? `${lang('global.guild')}: \`${parseFloat((cmd.cooldowns.guild / 1000).toFixed(2))}\`s${cmd.cooldowns.user ? ', ' : ''}` : '') +
              (cmd.cooldowns.user ? `${lang('global.user')}: \`${parseFloat((cmd.cooldowns.user / 1000).toFixed(2))}\`s` : '')
          } : null,
          cmd.usage ? { name: lang('one.usage'), value: `${cmd.slashCommand ? lang('one.lookAtDesc') : ''} ${helpLang('usage') || ''}`, inline: false } : null
        ].filter(Boolean);
      }

      return message.customReply({ embeds: [embed] });
    }

    embed.data.title = lang('all.embedTitle');
    embed.setThumbnail(message.guild.members.me.displayAvatarURL());

    for (const category of getDirectoriesSync('./Commands').map(e => e.toUpperCase())) {
      if (category == 'OWNER-ONLY') continue;

      let data = listCommands(client.commands, '', 1, category);
      data = listCommands(client.slashCommands, data[0], data[1], category);

      if (data[1] == 1) continue;

      let cmdList = data[0];

      if (cmdList.endsWith('\n> ')) cmdList = cmdList.slice(0, -4);
      if (cmdList.endsWith(', ')) cmdList = cmdList.slice(0, -2);
      if (!cmdList.endsWith('`')) cmdList += '`';

      if (cmdList) embed.addFields([{ name: `**${category} [${data[1] - 1}]**`, value: `> ${cmdList}\n`, inline: true }]);
    }

    if (!embed.data.fields) embed.data.description = lang('all.notFound');
    else embed.data.footer = { text: lang('all.embedFooterText') };

    message.customReply({ embeds: [embed] });
  }
}