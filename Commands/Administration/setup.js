const
  { Constants, EmbedBuilder, Colors } = require('discord.js'),
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
  beta: true,
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
          autocomplete: true,
          autocompleteOptions: function () { return getCmds(this.client); }
        },
        { name: 'get', type: 'Boolean' },
        ...Array(6).fill({ type: 'Role' }).map((e, i) => ({ ...e, name: `role_${i + 1}` })),
        ...Array(6).fill({ type: 'Channel', channelTypes: Constants.TextBasedChannelTypes }).map((e, i) => ({ ...e, name: `channel_${i + 1}` })),
        ...Array(6).fill({ type: 'User' }).map((e, i) => ({ ...e, name: `member_${i + 1}` }))
      ]
    }
  ],

  run: async function (lang) {
    switch (this.options.getSubcommand()) {
      case 'toggle_module': {
        const
          module = this.options.getString('module'),
          setting = this.client.db.get('guildSettings')[this.guild.id]?.[module]?.enable;

        this.client.db.update('guildSettings', `${this.guild.id}.${module}.enable`, !setting);
        return this.editReply(lang('toggledModule', { name: module, state: setting ? lang('global.disabled') : lang('global.enabled') }));
      }
      case 'toggle_command': {
        const
          command = this.options.getString('command'),
          commandData = this.client.db.get('guildSettings')[this.guild.id]?.commandSettings?.[command]?.disabled || {},
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

        [
          [...new Set(this.options.data[0].options.filter(e => e.name.includes('role')).map(e => e.value))],
          [...new Set(this.options.data[0].options.filter(e => e.name.includes('member')).map(e => e.value))],
          [...new Set(this.options.data[0].options.filter(e => e.name.includes('channel')).map(e => e.value))]
        ].forEach((ids, i) => {
          let type = 'roles';
          if (i) type = i == 1 ? 'channels' : 'users';

          for (const id of ids) {
            if (commandData[type]?.includes(id)) {
              commandData[type] = commandData[type].filter(e => e != id);
              count.enabled[type]++;
              continue;
            }

            commandData[type] = [...(commandData[type] || []), id];
            count.disabled[type]++;
          }
        });

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
    }

  }
};