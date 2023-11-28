const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getTarget } = require('../../Utils'),
  images = [
    '1160179295885479946/furry-laughing-excitedly-hfi5mwmc56ekqv1j.gif', '1160179296279724092/giphy.gif',
    '1160179296854347786/kiss-furry.gif', '1160179297399603221/620b690b359402132ecdcf83c2187a8a28b09759_hq.gif',
    '1160179297739346042/fox-bird-kiss.gif', '1160179298137821205/1680181506.toffeecreation_kiss_gif_7.gif',
    '1160179298917945354/furry.gif', '1160180767821938861/diives-kiss.gif', '1160180768354598952/fortne.gif',
    '1160180768815988797/furry-protogen.gif'
  ];

/**@type {command}*/
module.exports = {
  name: 'furrykiss',
  aliases: { prefix: ['furry-kiss'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'target', type: 'User' }],

  run: function (lang) {
    const
      target = getTarget.call(this),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang(target ? 'embedDescriptionTarget' : 'embedDescription', { user: (this.member ?? this.user).displayName, target: target?.displayName }),
        image: { url: `https://cdn.discordapp.com/attachments/1160179234426339440/${images.random()}` },
        footer: { text: this.user.username },
        color: Colors.White
      });

    return this.customReply({ embeds: [embed] });
  }
};