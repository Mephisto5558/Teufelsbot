const
  { EmbedBuilder, Colors } = require('discord.js'),
  { I18nProvider, permissionTranslator } = require('../../Utils'),
  ownerOnlyFolders = require('../../config.json')?.ownerOnlyFolders?.map(e => e?.toUpperCase()) || ['OWNER-ONLY'];

module.exports = {
  name: 'help',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  ephemeralDefer: true,
  beta: true,
  options: [{
    name: 'command',
    type: 'String',
    autocompleteOptions: function () { return [...new Set([...this.client.prefixCommands.filter(e => !e.disabled && this.client.botType != 'dev' || e.beta).keys(), ...this.client.slashCommands.filter(e => !e.disabled && this.client.botType != 'dev' || e.beta).keys()])]; },
    strictAutocomplete: true
  }],

  run: function (lang) {
    const
      embed = new EmbedBuilder({ color: Colors.Blurple }),
      query = (this.args?.[0] || this.options?.getString('command'))?.toLowerCase();

    if (query) {
      const cmd = this.client.prefixCommands.get(query) || this.client.slashCommands.get(query);

      if (!cmd?.name || cmd.hideInHelp || cmd.disabled || (ownerOnlyFolders.includes(cmd.category.toUpperCase()) && this.user.id != this.client.application.owner.id)) {
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
          cmd.aliasOf && { name: lang('one.aliasOf'), value: `\`${cmd.aliasOf}\``, inline: true },
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
    embed.data.thumbnail = { url: this.guild.members.me.displayAvatarURL() };

    embed.addFields(Object.entries([...this.client.prefixCommands, ...this.client.slashCommands]
      .reduce((acc, [, e]) => {
        const category = e.category.toUpperCase();
        if ((ownerOnlyFolders.includes(category) && this.user.id != this.client.application.owner.id) || acc[category]?.includes(e.name) || e.aliasOf || e.hideInHelp || e.disabled || !(this.client.botType != 'dev' || e.beta)) return acc;

        if (acc[category]) acc[category].push(e.name);
        else acc[category] = [e.name];
        return acc;
      }, {})
    ).reduce((acc, [category, commands]) => commands.length ? [...acc, ({ name: `**${category} [${commands.length}]**`, value: `> \`${commands.join('`, `')}\``, inline: true })] : acc, []));

    if (embed.data.fields.length) embed.data.footer = { text: lang('all.embedFooterText') };
    else embed.data.description = lang('all.notFound');

    return this.customReply({ embeds: [embed] });
  }
};