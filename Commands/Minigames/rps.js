const
  { getTarget } = require('../../Utils'),
  { rps_sendChallenge: sendChallenge } = require('../../Utils/componentHandler/');

module.exports = {
  name: 'rps',
  aliases: { prefix: ['rockpaperscissors'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'opponent', type: 'User' }],

  /**@this GuildInteraction|GuildMessage @param {lang}lang*/
  run: function (lang) {
    return sendChallenge.call(this, this.member, getTarget({ targetOptionName: 'opponent' }), lang);
  }
};