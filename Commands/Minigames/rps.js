const
  { Command, OptionType, CommandType } = require('@mephisto5558/command'),
  { getTargetMembers } = require('#Utils'),
  { rps_sendChallenge: sendChallenge } = require('#Utils/componentHandler');

module.exports = new Command({
  types: [CommandType.slash, CommandType.prefix],
  aliases: { [CommandType.prefix]: ['rockpaperscissors'], [CommandType.slash]: ['rockpaperscissors'] },
  cooldowns: { user: '1s' },
  options: [{ name: 'opponent', type: OptionType.User }],

  async run(lang) {
    return sendChallenge.call(this, lang, this.member, getTargetMembers(this, { targetOptionName: 'opponent' }));
  }
});