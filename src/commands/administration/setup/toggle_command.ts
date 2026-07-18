import { Colors, Constants, EmbedBuilder, bold, channelMention, inlineCode, roleMention, userMention } from 'discord.js';
import { CommandOption, OptionType } from '@mephisto5558/command';

import type { CommandType } from '@mephisto5558/command';


const types = [['role', 'roles'], ['member', 'users'], ['channel', 'channels']] as const;

export default CommandOption.create<readonly [CommandType.Slash]>()({
  name: 'toggle_command',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'command',
      type: OptionType.String,
      required: true,
      autocompleteOptions() { return this.client.commandManager.commands.keys(); },
      strictAutocomplete: true
    },
    { name: 'get', type: OptionType.Boolean },
    /* eslint-disable @typescript-eslint/no-magic-numbers -- TODO: convert to selectMenu */
    ...Array.from({ length: 6 }, (_, i) => ({ type: OptionType.Role, name: `role_${i + 1}` })),
    ...Array.from({ length: 6 }, (_, i) => ({
      type: OptionType.Channel, name: `channel_${i + 1}`,
      channelTypes: Constants.GuildTextBasedChannelTypes
    })),
    ...Array.from({ length: 6 }, (_, i) => ({ type: OptionType.User, name: `member_${i + 1}` }))
    /* eslint-enable @typescript-eslint/no-magic-numbers */
  ],

  async run(lang) {
    const
      command = this.options.getString('command', true).toLowerCase(),

      /* eslint-disable-next-line @typescript-eslint/no-non-null-assertion -- own command will never be undefined */
      setupCommand = this.client.commandManager.get(this.commandName)!,
      commandData = this.guild.db.config.commands?.[command]?.disabled,
      { roles = [], channels = [], users = [] } = commandData ?? {},
      count = { enabled: { channels: 0, users: 0, roles: 0 }, disabled: { channels: 0, users: 0, roles: 0 } };


    if (this.options.getBoolean('get')) {
      const
        fieldList = [['roles', roles], ['channels', channels], ['users', users]] as const,
        fields = fieldList.filter(([, e]) => !!e.length).map(([k, v]) => ({
          name: lang(k),
          value: v.includes('*')
            ? lang('list.all')
            : v.map(e => {
                let fn: GenericFunction<string> = userMention;
                if (k == 'roles') fn = roleMention;
                else if (k == 'channels') fn = channelMention;

                return fn(e);
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
        commandMention: setupCommand.mention('toggle_command')
      }));
    }

    for (const [typeFilter, type] of types) {
      const ids = this.options.data[0]!.options!.filter(e => e.name.includes(typeFilter)).map(e => e.value).unique() as Snowflake[];

      for (const id of ids) {
        if (commandData?.[type].includes(id)) {
          commandData[type] = commandData[type].filter(e => e !== id);
          count.enabled[type]++;
          continue;
        }

        commandData[type] = [...commandData?.[type] ?? [], id];
        count.disabled[type]++;
      }
    }

    const embed = new EmbedBuilder({
      title: lang('embedTitle', command),
      description: lang('embedDescription', setupCommand.mention('toggle_command')),
      fields: Object.entries(count).filter(([, v]) => Object.values(v).some(Boolean))
        .map(([k, v]) => ({
          name: lang(`embed.${k}`),
          value: Object.entries(v)
            .filter(([, e]) => !!e)
            .map(([k, v]) => `${lang(k)}: ${bold(String(v))}`)
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