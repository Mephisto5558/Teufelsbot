const
  { getTargetMember } = require('#Utils'),
  { rps_sendChallenge: sendChallenge } = require('#Utils/componentHandler');

module.exports = new MixedCommand({
  aliases: { prefix: ['rockpaperscissors'] },
  cooldowns: { user: 1000 },
  options: [new CommandOption({ name: 'opponent', type: 'User' })],

  run(lang) {
    return sendChallenge.call(this, this.member, getTargetMember(this, { targetOptionName: 'opponent' }), lang);
  }
});