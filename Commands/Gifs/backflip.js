const
  { EmbedBuilder, Colors } = require('discord.js'),
  images = [
    '1137786635392651314/backflip-anime.gif', '1137786636017602632/flip-anime.gif', '1137786636659335321/ichigo-mashimaro-backflip.gif',
    '1137786637162664106/pokemon-mew.gif', '1137786637573693561/neo-rwby.gif', '1137786637959581747/ezgif-5-7572493502.gif', '1137786638324469820/back-flip-attack-on-titan.gif'
  ];

/**@type {command}*/
module.exports = {
  name: 'backflip',
  aliases: { prefix: ['flip'] },
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,

  run: function (lang) {
    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', this.member?.displayName || this.user.displayName),
      image: { url: `https://cdn.discordapp.com/attachments/1137786275701727343/${images.random()}` },
      color: Colors.White
    });

    return this.customReply({ embeds: [embed] });
  }
};