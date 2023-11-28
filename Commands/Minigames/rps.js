const
  { getTarget } = require('../../Utils'),
  { rps_sendChallenge: sendChallenge } = require('../../Utils/componentHandler/');

/**@type {command}*/
module.exports = {
  name: 'rps',
  aliases: { prefix: ['rockpaperscissors'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'opponent', type: 'User' }],

  /**@this GuildInteraction|GuildMessage*/
  run: function (lang) {
    return sendChallenge.call(this, this.member, getTarget.call(this, { targetOptionName: 'opponent' }), lang);
  }
};