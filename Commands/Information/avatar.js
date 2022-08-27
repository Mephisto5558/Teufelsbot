const { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = {
  name: 'avatar',
  aliases: { prefix: [], slash: [] },
  description: 'shows the user avatar',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 1000 },
  category: 'Information',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'target',
      description: 'the user you want to get the avatar of',
      type: 'User',
      required: false
    },
    {
      name: 'size',
      description: 'The size of the picture',
      type: 'Number',
      required: false,
      choices: [
        { name: 16, value: 16 }, { name: 32, value: 32 },
        { name: 56, value: 56 }, { name: 64, value: 64 },
        { name: 96, value: 96 }, { name: 128, value: 128 },
        { name: 256, value: 256 }, { name: 300, value: 300 },
        { name: 512, value: 512 }, { name: 600, value: 600 },
        { name: 1024, value: 1024 }, { name: 2048, value: 2048 }
      ]
    }
  ],

  run: async (message, lang, { functions }) => {
    const
      target = message.options?.getMember('target') || message.mentions?.members?.first() || message.guild.members.cache.find(e => [e.user.id, e.user.username, e.user.tag, e.nickname].some(e => [...message.args, message.content].includes(e))) || message.member,
      avatarURL = await target.displayAvatarURL({ size: message.options?.getNumber('size') || 2048 }),
      embed = new EmbedBuilder({
        description: lang('embedDescription', target.user.username),
        color: Colors.White,
        image: { url: avatarURL },
        footer: { text: message.member.tag }
      }),
      row = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('downloadButton'),
          url: avatarURL,
          style: ButtonStyle.Link
        })]
      });

    message.customreply({ embeds: [embed], components: [row] });
  }
}