const
  { getTargetMember } = require('../../Utils'),
  { rps_sendChallenge: sendChallenge } = require('../../Utils/componentHandler/');

/** @type {command<'both'>}*/
module.exports = {
  aliases: { prefix: ['rockpaperscissors'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'opponent', type: 'User' }],

  run: function (lang) {
    return sendChallenge.call(this, this.member, getTargetMember.call(this, { targetOptionName: 'opponent' }), lang);
  }
};