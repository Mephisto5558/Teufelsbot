/* eslint camelcase: ["error", {allow: ["toggle_module", "toggle_command"]}] */
const
  { Constants, EmbedBuilder, Colors } = require('discord.js'),
  backup = new Map([['creator', 0], ['owner', 1], ['creator+owner', 2], ['admins', 3]]),
  loggerActionTypes = ['messageDelete', 'messageUpdate', 'voiceChannelActivity', 'sayCommandUsed'],
  getCMDs = /** @param {Client}client*/ client => [...new Set([...client.prefixCommands.filter(e => !e.aliasOf).keys(), ...client.slashCommands.filter(e => !e.aliasOf).keys()])],
  /** @type {Record<string, (this: GuildInteraction, lang: lang) =>Promise<unknown>>} */
  setupMainFunctions = {
    toggle_module: async function toggleModule(lang) {
      const
        module = this.options.getString('module', true),
        setting = this.guild.db[module]?.enable; // Todo: document and probably sth like `this.guild.db.modules[module]` for better typing

      await this.client.db.update('guildSettings', `${this.guild.id}.${module}.enable`, !setting);
      return this.editReply(lang('success', { name: module, state: lang(setting ? 'global.disabled' : 'global.enabled') }));
    },

    toggle_command: async function toggleCommand(lang) {
      const
        command = this.options.getString('command', true),
        commandData = this.guild.db.config.commands?.[command]?.disabled ?? {},
        { roles = [], channels = [], users = [] } = commandData,
        count = { enabled: { channels: 0, users: 0, roles: 0 }, disabled: { channels: 0, users: 0, roles: 0 } };

      if (!getCMDs(this.client).includes(command)) return this.editReply(lang('notFound'));

      if (this.options.getBoolean('get')) {
        const fields = [['roles', roles], ['channels', channels], ['users', users]].filter(([, e]) => e?.length).map(([k, v]) => ({
          name: lang(k),
          value: v.includes('*')
            ? lang('list.all')
            : v.map(e => {
              if (k == 'roles') return `<@&${e}>`;
              return `${k == 'channels' ? '<#' : '<@'}${e}>`;
            }).join(', '),
          inline: false
        }));

        const embed = new EmbedBuilder({
          title: lang('list.embedTitle', command),
          color: Colors.White,
          ...fields.length ? { fields } : { description: lang('list.embedDescription') }
        });

        return this.editReply({ embeds: [embed] });
      }

      if (this.options.data[0].options.length == (this.options.data[0].options.some(e => e.name == 'get') ? 2 : 1)) {
        await this.client.db.update('guildSettings', `${this.guild.id}.config.commands.${command}.disabled.users`, users.includes('*') ? users.filter(e => e != '*') : ['*', ...users]);
        return this.editReply(lang(users.includes('*') ? 'enabled' : 'disabled', command));
      }

      if (users.includes('*')) return this.editReply(lang('isDisabled', { command, id: this.command.id }));

      for (const [typeIndex, typeFilter] of ['role', 'member', 'channel'].entries()) {
        const ids = [...new Set(this.options.data[0].options.filter(e => e.name.includes(typeFilter)).map(e => e.value))];

        let type = 'roles';
        if (typeIndex == 1) type = 'users';
        else if (typeIndex == 2) type = 'channels';

        for (const id of ids) {
          if (commandData[type]?.includes(id)) {
            commandData[type] = commandData[type].filter(e => e !== id);
            count.enabled[type]++;
            continue;
          }

          commandData[type] = [...commandData[type] ?? [], id];
          count.disabled[type]++;
        }
      }

      const embed = new EmbedBuilder({
        title: lang('embedTitle', command),
        description: lang('embedDescription', this.command.id),
        fields: Object.entries(count).filter(([, v]) => Object.values(v).find(Boolean))
          .map(([k, v]) => ({
            name: lang(`embed.${k}`),
            value: Object.entries(v).filter(([, e]) => e)
              .map(([k, v]) => `${lang(k)}: **${v}**`)
              .join('\n'),
            inline: true
          })),
        color: Colors.White
      });

      await this.client.db.update('guildSettings', `${this.guild.id}.config.commands.${command}.disabled`, commandData);
      return this.editReply({ embeds: [embed] });
    },

    language: async function setLanguage() {
      const
        language = this.options.getString('language', true),

        /** @type {lang}*/
        newLang = this.client.i18n.__.bind(this.client.i18n, { locale: this.client.i18n.availableLocales.has(language) ? language : this.client.i18n.config.defaultLocale }),
        { category, name } = this.client.slashCommands.get(this.commandName),
        embed = new EmbedBuilder({
          title: newLang(`commands.${category.toLowerCase()}.${name}.language.embedTitle`),
          description: newLang(`commands.${category.toLowerCase()}.${name}.language.embedDescription`, newLang('global.languageName')),
          color: Colors.Green
        });

      await this.client.db.update('guildSettings', `${this.guild.id}.config.lang`, language);
      return this.editReply({ embeds: [embed] });
    },

    prefix: async function setPrefix(lang) {
      const newPrefix = this.options.getString('new_prefix', true);
      const prefixCaseInsensitive = this.options.getBoolean('case_insensitive') ?? this.guild.db.config.prefix?.caseinsensitive ?? false;

      await this.client.db.update('guildSettings', `${this.guild.id}.config.${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refix`, { prefix: newPrefix, caseinsensitive: prefixCaseInsensitive });
      return this.customReply(lang('saved', newPrefix));
    },

    serverbackup: async function serverBackup(lang) {
      await this.client.db.update('guildSettings', 'serverbackup.allowedToLoad', Number.parseInt(backup.get(this.options.getString('allowed_to_load', true))));
      return this.editReply(lang('success'));
    },

    autopublish: async function toggleAutopublish(lang) {
      const enabled = this.options.getBoolean('enabled');
      await this.client.db.update('guildSettings', `${this.guild.id}.config.autopublish`, enabled);
      return this.customReply(lang('success', lang(`global.${enabled ? 'enabled' : 'disabled'}`)));
    },

    logger: async function configureLogger(lang) {
      const
        action = this.options.getString('action', true),
        channel = (this.options.getChannel('channel') ?? this.guild.channels.cache.get(this.guild.db.config.logger?.[action].channel))?.id ?? this.channel,
        enabled = this.options.getBoolean('enabled') ?? (action == 'all' ? undefined : !this.guild.db.config.logger?.[action].enabled);

      if (!channel) return this.editReply(lang('noChannel'));
      if (action == 'all') {
        if (enabled == undefined) return this.editReply(lang('noEnabled'));
        for (const actionType of loggerActionTypes) await this.client.db.update('guildSettings', `${this.guild.id}.config.logger.${actionType}`, { channel, enabled });
      }

      await this.client.db.update('guildSettings', `${this.guild.id}.config.logger.${action}`, { channel, enabled });
      return this.editReply(lang(enabled ? 'enabled' : 'disabled', { channel, action: lang(`actions.${action}`) }));
    }
  };

/** @type {command<'slash'>}*/
module.exports = {
  aliases: { slash: ['config'] },
  permissions: { user: ['ManageGuild'] },
  cooldowns: { user: 1e4 },
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'toggle_module',
      type: 'Subcommand',
      options: [{
        name: 'module',
        type: 'String',
        required: true,
        choices: ['gatekeeper', 'birthday']
      }]
    },
    {
      name: 'toggle_command',
      type: 'Subcommand',
      options: [
        {
          name: 'command',
          type: 'String',
          required: true,
          autocompleteOptions: function () { return getCMDs(this.client); },
          strictAutocomplete: true
        },
        { name: 'get', type: 'Boolean' },
        ...Array.from({ length: 6 }, (_, i) => ({ type: 'Role', name: `role_${i + 1}` })),
        ...Array.from({ length: 6 }, (_, i) => ({ type: 'Channel', name: `channel_${i + 1}`, channelTypes: Constants.TextBasedChannelTypes })),
        ...Array.from({ length: 6 }, (_, i) => ({ type: 'User', name: `member_${i + 1}` }))
      ]
    },
    {
      name: 'language',
      type: 'Subcommand',
      cooldowns: { guild: 1e4 },
      options: [{
        name: 'language',
        type: 'String',
        required: true,
        autocompleteOptions: function () {
          return [...this.client.i18n.availableLocales.keys()].reduce((acc, locale) => {
            if (acc.length > 25) return acc;

            const name = this.client.i18n.__({ locale, undefinedNotFound: true }, 'global.languageName') ?? locale;
            if (name.toLowerCase().includes(this.focused.value.toLowerCase()) || locale.toLowerCase().includes(this.focused.value.toLowerCase()))
              acc.push({ name, value: locale });

            return acc;
          }, []);
        },
        strictAutocomplete: true
      }]
    },
    {
      name: 'prefix',
      type: 'Subcommand',
      options: [
        {
          name: 'new_prefix',
          type: 'String',
          required: true
        },
        { name: 'case_insensitive', type: 'Boolean' }
      ]
    },
    {
      name: 'serverbackup',
      type: 'Subcommand',
      options: [{
        name: 'allowed_to_load',
        type: 'String',
        required: true,
        autocompleteOptions: [...backup.keys()],
        strictAutocomplete: true
      }]
    },
    {
      name: 'autopublish',
      type: 'Subcommand',
      options: [{
        name: 'enabled',
        type: 'Boolean',
        required: true
      }]
    },
    {
      name: 'logger',
      type: 'Subcommand',
      options: [
        {
          name: 'action',
          type: 'String',
          required: true,
          choices: ['all', ...loggerActionTypes]
        },
        {
          name: 'channel',
          type: 'Channel',
          channelTypes: Constants.TextBasedChannelTypes
        },
        { name: 'enabled', type: 'Boolean' }
      ]
    }
  ],

  run: function (lang) {
    lang.__boundArgs__[0].backupPath += `.${this.options.getSubcommand().replaceAll(/_./g, e => e[1].toUpperCase())}`;
    return setupMainFunctions[this.options.getSubcommand()].call(this, lang);
  }
};