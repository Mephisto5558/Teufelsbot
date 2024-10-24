const
  { getTargetMember } = require('#Utils'),
  { rps_sendChallenge: sendChallenge } = require('#Utils/componentHandler');

/** @type {command<'both'>}*/
module.exports = {
  aliases: { prefix: ['rockpaperscissors'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'opponent', type: 'User' }],

  run(lang) {
    return sendChallenge.call(this, this.member, getTargetMember(this, { targetOptionName: 'opponent' }), lang);
  }
};