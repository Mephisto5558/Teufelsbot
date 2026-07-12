import { AllContexts, Command, CommandType, CooldownType, OptionType, isSlash } from '@mephisto5558/command';
import { afk: { nicknamePrefix, getAfkStatus, listAfkStatuses, setAfkStatus } } from '#utils';

const maxAllowedAFKMsgLength = 1000;

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  cooldowns: { [CooldownType.User]: '5s' },
  contexts: AllContexts,
  options: [
    {
      name: 'set',
      type: OptionType.Subcommand,
      options: [
        {
          name: 'message',
          type: OptionType.String,
          maxLength: maxAllowedAFKMsgLength
        },
        { name: 'global', type: OptionType.Boolean }
      ]
    },
    {
      name: 'get',
      type: OptionType.Subcommand,
      options: [{ name: 'target', type: OptionType.User }]
    }
  ],

  async run(lang) {
    if (isSlash(this) && this.options.getSubcommand() == 'get') {
      const target = this.inGuild() ? this.options.getMember('target') : this.options.getUser('target') ?? this.user;
      if (target) return getAfkStatus.call(this, target, lang);

      return listAfkStatuses.call(this, lang);
    }

    const global = this.options?.getBoolean('global') ?? this.args?.[0] == 'global';
    return setAfkStatus.call(
      this, lang, global,
      this.options?.getString('message') ?? this.content?.slice(global ? nicknamePrefix.length + 1 : 0, maxAllowedAFKMsgLength)
    );
  }
});