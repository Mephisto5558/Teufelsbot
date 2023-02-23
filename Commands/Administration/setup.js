const
  { Constants, EmbedBuilder, Colors } = require('discord.js'),
  { I18nProvider } = require('../../Utils'),
  backup = new Map([['creator', 0], ['owner', 1], ['creator+owner', 2], ['admins', 3]]),
  getCmds = client => [...new Set([...client.prefixCommands.filter(e => !e.aliasOf).keys(), ...client.slashCommands.filter(e => !e.aliasOf).keys()])],
  mention = (k, v) => {
    if (k == 'roles') return `<@&${v}>`;
    return (k == 'channels' ? '<#' : '<@') + `${v}>`;
  };

module.exports = {
  name: 'setup',
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
          autocompleteOptions: function () { return getCmds(this.client); }
        },
        { name: 'get', type: 'Boolean' },
        ...Array.from({ length: 6 }, (_, i) => ({ type: 'Role', name: `role_${i + 1}` })),
        ...Array.from({ length: 6 }, (_, i) => ({ type: 'Channel', channelTypes: Constants.TextBasedChannelTypes, name: `channel_${i + 1}` })),
        ...Array.from({ length: 6 }, (_, i) => ({ type: 'User', name: `member_${i + 1}` }))
      ]
    },
    {
      name: 'language',
      type: 'Subcommand',
      options: [{
        name: 'language',
        type: 'String',
        required: true,
        autocompleteOptions: function () { return I18nProvider.availableLocales.map((_, k) => ({ name: I18nProvider.__({ locale: k, undefinedNotFound: true }, 'global.languageName') ?? k, value: k })).filter(({ name, value }) => name.toLowerCase().includes(this.focused.value.toLowerCase()) || value.toLowerCase().includes(this.focused.value.toLowerCase())).slice(0, 25); }
      }]
    },
    {
      name: 'serverbackup',
      type: 'Subcommand',
      options: [{
        name: 'allowed_to_load',
        type: 'String',
        autocompleteOptions: [...backup.keys()],
        required: true
      }]
    }
  ],

  run: async function (lang) {
    switch (this.options.getSubcommand()) {
      case 'toggle_module': {
        const
          module = this.options.getString('module'),
          setting = this.guild.db[module]?.enable;

        this.client.db.update('guildSettings', `${this.guild.id}.${module}.enable`, !setting);
        return this.editReply(lang('toggledModule', { name: module, state: setting ? lang('global.disabled') : lang('global.enabled') }));
      }
      case 'toggle_command': {
        const
          command = this.options.getString('command'),
          commandData = this.guild.db.commandSettings?.[command]?.disabled || {},
          { roles = [], channels = [], users = [] } = commandData,
          count = { enabled: { channels: 0, users: 0, roles: 0 }, disabled: { channels: 0, users: 0, roles: 0 } };

        if (!getCmds(this.client).includes(command)) return this.editReply(lang('toggleCmd.notFound'));

        if (this.options.getBoolean('get')) {
          const fields = [['roles', roles], ['channels', channels], ['users', users]].filter(([, e]) => e?.length).map(([k, v]) => ({
            name: lang(`toggleCmd.${k}`),
            value: v.includes('*') ? lang('toggleCmd.list.all') : v.map(e => mention(k, e)).join(', '),
            inline: false
          }));

          const embed = new EmbedBuilder({
            title: lang('toggleCmd.list.embedTitle', command),
            color: Colors.White,
            ...(fields.length ? { fields } : { description: lang('toggleCmd.list.embedDescription') }),
          });

          return this.editReply({ embeds: [embed] });
        }

        if (this.options.data[0].options.length == (this.options.data[0].options.find(e => e.name == 'get') ? 2 : 1)) {
          this.client.db.update('guildSettings', `${this.guild.id}.commandSettings.${command}.disabled`, { users: users.includes('*') ? users.filter(e => e != '*') : ['*', ...users] });
          return this.editReply(lang(`toggleCmd.${users.includes('*') ? 'enabled' : 'disabled'}`, command));
        }

        if (users.includes('*')) return this.editReply(lang('toggleCmd.isDisabled', { command, id: this.command.id }));

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

            commandData[type] = [...(commandData[type] || []), id];
            count.disabled[type]++;
          }
        }

        this.client.db.update('guildSettings', `${this.guild.id}.commandSettings.${command}.disabled`, commandData);

        const embed = new EmbedBuilder({
          title: lang('toggleCmd.embedTitle', command),
          description: lang('toggleCmd.embedDescription', this.command.id),
          fields: Object.entries(count).filter(([, v]) => Object.values(v).find(Boolean)).map(([k, v]) => ({
            name: lang(`toggleCmd.embed.${k}`,),
            value: Object.entries(v).filter(([, e]) => e).map(([k, v]) => lang(`toggleCmd.${k}`) + `: **${v}**`).join('\n'),
            inline: true
          })),
          color: Colors.White
        });

        return this.editReply({ embeds: [embed] });
      }
      case 'language': {
        const
          language = this.options.getString('language'),
          embed = new EmbedBuilder({
            title: lang('language.embedTitle'),
            description: lang('language.embedDescription', language),
            color: Colors.Green
          });

        this.client.db.update('guildSettings', `${this.guild.id}.config.lang`, language);
        return this.editReply({ embeds: [embed] });
      }
      case 'serverbackup': {
        this.client.db.update('guildSettings', 'serverbackup.allowedToLoad', parseInt(backup.get(this.options.getString('allowed_to_load'))));
        return this.editReply(lang('serverbackup.success'));
      }
    }
  }
};