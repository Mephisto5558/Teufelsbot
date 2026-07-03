const
  { Command, CommandType, CooldownType, OptionType } = require('@mephisto5558/command'),
  { getTargetMembers } = require('#utils'),
  { rps_sendChallenge: sendChallenge } = require('#utils/componentHandler');

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  aliases: { [CommandType.Prefix]: ['rockpaperscissors'], [CommandType.Slash]: ['rockpaperscissors'] },
  cooldowns: { [CooldownType.User]: '1s' },
  options: [{ name: 'opponent', type: OptionType.User }],

  async run(lang) {
    return sendChallenge.call(this, lang, this.member, getTargetMembers(this, [{ targetOptionName: 'opponent' }]));
  }
});