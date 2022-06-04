const
  { Command } = require('reconlx'),
  { Util } = require('discord.js'),
  validateURL = require('url-exists');

module.exports = new Command({
  name: 'addemoji',
  alias: [],
  description: 'adds a emoji to your guild.',
  usage: '',
  permissions: {
    client: ['MANAGE_EMOJIS_AND_STICKERS'],
    user: ['MANAGE_EMOJIS_AND_STICKERS']
  },
  cooldowns: { global: 0, user: 1000 },
  category: 'USEFUL',
  slashCommand: true,
  prefixCommand: false, beta: true,
  options: [
    {
      name: 'input',
      description: 'provide an emoji or a url to a picture.',
      type: 'STRING',
      required: true
    },
    {
      name: 'name',
      description: 'the name of the new emoji',
      type: 'STRING',
      required: false
    }
  ],

  run: async (_, __, interaction) => {
    let input = interaction.options.getString('input');
    let inputName = interaction.option.getString('name');
    const emoticon = Util.parseEmoji(input);

    if (inputName && inputName.length < 2) return interaction.editReply('The emoji name ust be longer than 1 character!');
    else if (inputName.length > 32) inputName = inputName.subString(0, 32);

    if (emoticon) {
      if (!message.guild.emojis.cache.has(emoticon?.id)) return interaction.editReply('That emoji is already on this guild');
      input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`
    }
    else {
      if (!/^https?:\/\/.+\.(jpg|jpeg|png|webp|gif|svg)$/.match(input)) {
        return interaction.editReply(
          'The provided argument is not a valid url!\n' +
          'Make sure it ends with one of the following extentions:\n' +
          'jpg`, `jpeg`, `png`, `webp`, `gif`, `svg`'
        )
      }

      if (validateURL(input)) return interaction.editReply('The provided url was not found.');
    }

    interaction.guild.emojis.create(input, inputName || emoticon?.name || 'emoji', { reason: 'addemoji command' })
      .then(emoji => interaction.editReply(`Successfully added **${emoji.name}**! ${emoji}`))
      .catch(err => interaction.editReply(
        `Unable to create the emoji for reason\n:` +
        '```' + err + '```'
      ));

  }
})