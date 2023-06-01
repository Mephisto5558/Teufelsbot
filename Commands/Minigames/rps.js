const { rps_sendChallenge } = require('../../Utils/buttonPressHandler/');

module.exports = {
  name: 'rps',
  aliases: { prefix: ['rockpaperscissors'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'opponent', type: 'User' }],

  run: function (lang) {
    return rps_sendChallenge.call(this, this.member, this.options?.getMember('opponent') || this.args?.[0], lang);
  }
};