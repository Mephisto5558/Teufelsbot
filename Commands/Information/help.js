const
  { EmbedBuilder, Colors } = require('discord.js'),
  { I18nProvider, permissionTranslator } = require('../../Utils'),
  ownerOnlyFolders = require('../../config.json')?.ownerOnlyFolders?.map(e => e?.toLowerCase()) || ['owner-only'];

function listCommands(list, output, count, category) {
  for (const [, command] of list) {
    if (command.category?.toLowerCase() != category?.toLowerCase() || command.hideInHelp || command.disabled || output.includes(`\`${command.name}\``)) continue;

    if (!(count % 5)) output += `\`${command.name ?? command}\`\n> `;
    else output += `\`${command.name ?? command}\`, `;
    count++;
  }
  return [output, count];
}

module.exports = {
  name: 'help',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  ephemeralDefer: true,
  options: [{
    name: 'command',
    type: 'String',
    autocompleteOptions: function () { return [...new Set([...this.client.prefixCommands.keys(), ...this.client.slashCommands.keys()])]; }
  }], beta: true,

  run: function (lang) {
    const
      embed = new EmbedBuilder({ color: Colors.Blurple }),
      query = (this.args?.[0] || this.options?.getString('command'))?.toLowerCase();

    if (query) {
      const cmd = this.client.prefixCommands.get(query) || this.client.slashCommands.get(query);

      if (!cmd?.name || cmd.hideInHelp || cmd.disabled || (ownerOnlyFolders.includes(cmd.category.toLowerCase()) && this.user.id != this.client.application.owner.id)) {
        embed.data.description = lang('one.notFound', query);
        embed.data.color = Colors.Red;
      }
      else {
        const helpLang = I18nProvider.__.bind(I18nProvider, { undefinedNotFound: true, locale: this.guild.localeCode, backupPath: `commands.${cmd.category.toLowerCase()}.${cmd.name}` });

        embed.data.title = lang('one.embedTitle', cmd.name);
        embed.data.description = helpLang('description') ?? lang('one.noDescription');
        if (helpLang('usage')) embed.data.footer = { text: lang('one.embedFooterText', this.guild.db.config?.prefix || this.client.defaultSettings.config.prefix) };
        embed.data.fields = [
          cmd.aliases?.prefix?.length && { name: lang('one.prefixAlias'), value: `\`${cmd.aliases.prefix.join('`, `')}\``, inline: true },
          cmd.aliases?.slash?.length && { name: lang('one.slashAlias'), value: `\`${cmd.aliases.slash.join('`, `')}\``, inline: true },
          cmd.permissions?.client?.length && { name: lang('one.botPerms'), value: `\`${permissionTranslator(cmd.permissions.client, lang.__boundArgs__[0].locale).join('`, `')}\``, inline: false },
          cmd.permissions?.user?.length && { name: lang('one.userPerms'), value: `\`${permissionTranslator(cmd.permissions.user, lang.__boundArgs__[0].locale).join('`, `')}\``, inline: true },
          (cmd.cooldowns?.user || cmd.cooldowns?.guild) && {
            name: lang('one.cooldowns'), inline: false,
            value: Object.entries(cmd.cooldowns).filter(([, e]) => e).map(([k, v]) => {
              let min = Math.floor(v / 60000), sec = (v % 60000 / 1000);
              sec = !(sec % 1) ? Math.floor(sec) : sec.toFixed(2);

              if (min && sec) return `${lang('global.' + k)}: ${min}min ${sec}s`;
              return lang(`global.${k}`) + ': ' + (min ? `${min}min` : `${sec}s`);
            }).join(', ')
          },
          helpLang('usage') && { name: lang('one.usage'), value: `${cmd.slashCommand ? lang('one.lookAtDesc') : ''} ${helpLang('usage') || ''}`, inline: false }
        ].filter(Boolean);
      }

      return this.customReply({ embeds: [embed] });
    }

    embed.data.title = lang('all.embedTitle');
    embed.setThumbnail(this.guild.members.me.displayAvatarURL());

    for (const category of getDirectoriesSync('./Commands').map(e => e.toUpperCase())) {
      if (ownerOnlyFolders.includes(category.toLowerCase()) && this.user.id != this.client.application.owner.id) continue;

      let data = listCommands(this.client.prefixCommands, '', 1, category);
      data = listCommands(this.client.slashCommands, data[0], data[1], category);

      if (data[1] == 1) continue;

      let cmdList = data[0];

      if (cmdList.endsWith('\n> ')) cmdList = cmdList.slice(0, -4);
      if (cmdList.endsWith(', ')) cmdList = cmdList.slice(0, -2);
      if (!cmdList.endsWith('`')) cmdList += '`';

      if (cmdList) embed.addFields([{ name: `**${category} [${data[1] - 1}]**`, value: `> ${cmdList}\n`, inline: true }]);
    }

    if (!embed.data.fields) embed.data.description = lang('all.notFound');
    else embed.data.footer = { text: lang('all.embedFooterText') };

    this.customReply({ embeds: [embed] });
  }
};