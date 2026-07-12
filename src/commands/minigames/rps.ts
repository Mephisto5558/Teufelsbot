import { Command, CommandType, CooldownType, OptionType } from '@mephisto5558/command';
import { getTargetMembers } from '#utils';
import { rps_sendChallenge: sendChallenge } from '#utils/componentHandler';

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  aliases: { [CommandType.Prefix]: ['rockpaperscissors'], [CommandType.Slash]: ['rockpaperscissors'] },
  cooldowns: { [CooldownType.User]: '1s' },
  options: [{ name: 'opponent', type: OptionType.User }],

  async run(lang) {
    return sendChallenge.call(this, lang, this.member, getTargetMembers(this, [{ targetOptionName: 'opponent' }]));
  }
});