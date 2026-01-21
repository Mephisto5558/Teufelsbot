const
  { Command, commandTypes } = require('@mephisto5558/command'),
  { getTargetMembers, timeFormatter: { msInSecond } } = require('#Utils'),
  { rps_sendChallenge: sendChallenge } = require('#Utils/componentHandler');

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  aliases: { [commandTypes.prefix]: ['rockpaperscissors'], [commandTypes.slash]: ['rockpaperscissors'] },
  cooldowns: { user: msInSecond },
  options: [{ name: 'opponent', type: 'User' }],

  async run(lang) {
    return sendChallenge.call(this, lang, this.member, getTargetMembers(this, { targetOptionName: 'opponent' }));
  }
});