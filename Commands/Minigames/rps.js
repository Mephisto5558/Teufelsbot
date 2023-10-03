const { rps_sendChallenge } = require('../../Utils/componentHandler/');

module.exports = {
  name: 'rps',
  aliases: { prefix: ['rockpaperscissors'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  options: [{ name: 'opponent', type: 'User' }],

  run: function (lang) {
    return rps_sendChallenge.call(this, this.member, this.options?.getMember('opponent') || this.mentions?.members.first() || this.guild.members.cache.find(e => [e.user.id, e.user.username, e.nickname].some(e => [...(this.args || []), this.content].includes(e))), lang);
  }
};