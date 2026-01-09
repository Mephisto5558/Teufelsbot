const
  { Colors, Constants, EmbedBuilder, bold, channelMention, inlineCode, roleMention, userMention } = require('discord.js'),
  { CommandOption } = require('@mephisto5558/command'),
  { commandMention } = require('#Utils'),

  getCMDs = /** @param {Client} client */ client => [...client.prefixCommands, ...client.slashCommands]
    .filter(([,e]) => !e.aliasOf)
    .map(([e]) => e)
    .unique(),

  /** @type {[['role', 'roles'], ['member', 'users'], ['channel', 'channels']]} */
  types = [['role', 'roles'], ['member', 'users'], ['channel', 'channels']];

/** @type {CommandOption<['slash']>} */
module.exports = new CommandOption({
  name: 'toggle_command',
  type: 'Subcommand',
  options: [
    {
      name: 'command',
      type: 'String',
      required: true,
      autocompleteOptions() { return getCMDs(this.client); },
      strictAutocomplete: true
    },
    { name: 'get', type: 'Boolean' },
    /* eslint-disable @typescript-eslint/no-magic-numbers -- TODO: convert to selectMenu */
    ...Array.from({ length: 6 }, (_, i) => ({ type: 'Role', name: `role_${i + 1}` })),
    ...Array.from({ length: 6 }, (_, i) => ({ type: 'Channel', name: `channel_${i + 1}`, channelTypes: Constants.GuildTextBasedChannelTypes })),
    ...Array.from({ length: 6 }, (_, i) => ({ type: 'User', name: `member_${i + 1}` }))
    /* eslint-enable @typescript-eslint/no-magic-numbers */
  ],

  async run(lang) {
    const
      command = this.options.getString('command', true),
      commandData = this.guild.db.config.commands?.[command]?.disabled ?? {},
      { roles = [], channels = [], users = [] } = commandData,
      count = { enabled: { channels: 0, users: 0, roles: 0 }, disabled: { channels: 0, users: 0, roles: 0 } };

    if (!getCMDs(this.client).includes(command)) return this.editReply(lang('notFound'));

    if (this.options.getBoolean('get')) {
      /** @type {[[string, (Snowflake | '*')[]], [string, (Snowflake | '*')[]], [string, (Snowflake | '*')[]]]} */
      const
        fieldList = [['roles', roles], ['channels', channels], ['users', users]],
        fields = fieldList.filter(([, e]) => !!e.length).map(([k, v]) => ({
          name: lang(k),
          value: v.includes('*')
            ? lang('list.all')
            : v.map(/** @param {Snowflake} e */ e => {
                if (k == 'roles') return roleMention(e);
                return k == 'channels' ? channelMention(e) : userMention(e);
              }).join(', '),
          inline: false
        })),

        embed = new EmbedBuilder({
          title: lang('list.embedTitle', command),
          color: Colors.White,
          ...fields.length ? { fields } : { description: lang('list.embedDescription') }
        });

      return this.editReply({ embeds: [embed] });
    }

    if (this.options.data[0].options.length == (this.options.data[0].options.some(e => e.name == 'get') ? 2 : 1)) {
      await this.guild.updateDB(`config.commands.${command}.disabled.users`, users.includes('*') ? users.filter(e => e != '*') : ['*', ...users]);
      return this.editReply(lang(users.includes('*') ? 'enabled' : 'disabled', inlineCode(command)));
    }

    if (users.includes('*')) {
      return this.editReply(lang('isDisabled', {
        command: inlineCode(command),
        commandMention: commandMention(`${this.commandName} toggle_command`, this.command.id)
      }));
    }

    for (const [typeFilter, type] of types) {
      const ids = this.options.data[0].options.filter(e => e.name.includes(typeFilter)).map(e => e.value).unique();

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
      description: lang('embedDescription', commandMention(`${this.commandName} toggle_command`, this.command.id)),
      fields: Object.entries(count).filter(([, v]) => Object.values(v).some(Boolean))
        .map(([k, v]) => ({
          name: lang(`embed.${k}`),
          value: Object.entries(v)
            .filter(([, e]) => !!e)
            .map(([k, v]) => `${lang(k)}: ${bold(v)}`)
            .join('\n'),
          inline: true
        })),
      color: Colors.White,
      footer: { text: lang('embedFooterText') }
    });

    await this.guild.updateDB(`config.commands.${command}.disabled`, commandData);
    return this.editReply({ embeds: [embed] });
  }
});