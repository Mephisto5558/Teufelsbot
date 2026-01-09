const
  { Command } = require('@mephisto5558/command'),
  { getTargetMembers, timeFormatter: { msInSecond } } = require('#Utils'),
  { rps_sendChallenge: sendChallenge } = require('#Utils/componentHandler');

module.exports = new Command({
  types: ['slash', 'prefix'],
  aliases: { prefix: ['rockpaperscissors'] },
  cooldowns: { user: msInSecond },
  options: [{ name: 'opponent', type: 'User' }],

  async run(lang) {
    return sendChallenge.call(this, lang, this.member, getTargetMembers(this, { targetOptionName: 'opponent' }));
  }
});