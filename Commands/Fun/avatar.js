const
  { Command } = require('reconlx'),
  { MessageEmbed, MessageActionRow, MessageButton } = require('discord.js'),
  { colors } = require('../../Settings/embed.json');

module.exports = new Command({
  name: 'avatar',
  alias: [],
  description: 'shows the user avatar',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'target',
      description: 'the user you want to get the avatar of',
      type: 'USER',
      required: false
    },
    {
      name: 'size',
      description: 'The size of the picture',
      type: 'NUMBER',
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
      if (message?.args[0]) target = (await message.guild.members.fetch(message.args[0].replace(/[<@>]/g, ''))).user;
      else target = await message.author
    }
    else {
      target = interaction.options?.getUser('target') || await interaction?.user.fetch();
      size = interaction.options?.getNumber('size')
    }

    const avatarURL = await target.avatarURL({ format: 'png', size: size || 2048, dynamic: true});

    let embed = new MessageEmbed()
      .setDescription(`**Avatar of ${target.username}**`)
      .setColor(colors.WHITE)
      .setImage(avatarURL)
      .setFooter({ text: interaction?.user.tag || message?.author.tag });

    let row = new MessageActionRow().addComponents(
      new MessageButton()
        .setLabel('Download picture')
        .setURL(avatarURL)
        .setStyle('LINK')
    );

    if(message) client.functions.reply({ embeds: [embed], components: [row] }, message);
    else interaction.editReply({ embeds: [embed], components: [row] });

  }
})