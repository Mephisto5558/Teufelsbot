const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');

module.exports = new Command({
  name: 'avatar',
  aliases: { prefix: [], slash: [] },
  description: 'shows the user avatar',
  usage: '',
  permissions: { client: ['EMBED_LINKS'], user: [] },
  cooldowns: { guild: 100, user: 1000 },
  category: 'Fun',
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

  run: async (client, message, interaction) => {

    let target, size;

    if (message) {
      if (message?.args[0]) {
        await client.lastRateLimitCheck(`/guilds/${message.guild.id}/members/:id`);
        target = (await message.guild.members.fetch(message.args[0].replace(/[<@>]/g, ''))).user;
      }
      else target = message.author
    }
    else {
      target = interaction.options?.getUser('target') || await interaction?.member
      size = interaction.options?.getNumber('size')
    }

    const avatarURL = await target.displayAvatarURL({ size: size || 2048 });

    let embed = new EmbedBuilder({
      description: `**Avatar of ${target.username}**`,
      color: Colors.White,
      image: avatarURL,
      footer: { text: interaction?.user.tag || message?.author.tag }
    });

    let row = new ActionRowBuilder({
      components: [new ButtonBuilder({
        label: 'Download picture',
        url: avatarURL,
        style: ButtonStyle.Link
      })]
    })

    if (message) client.functions.reply({ embeds: [embed], components: [row] }, message);
    else interaction.editReply({ embeds: [embed], components: [row] });

  }
})