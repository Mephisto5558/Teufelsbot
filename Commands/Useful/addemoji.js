const
  { Command } = require('reconlx'),
  { parseEmoji } = require('discord.js').Util,
  { request } = require('axios').default,
  urlRegex = /^.+\.(?:jpg|jpeg|png|webp|gif|svg)$/i;

async function urlExists(url) {
  try {
    const res = await request({ url: url });
    return !/4\d\d/.test(res.status);
  }
  catch { return }
}

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
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false, beta: true,
  options: [
    {
      name: 'emoji_or_url',
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
    let input = interaction.options.getString('emoji_or_url');
    let inputName = interaction.options.getString('name');
    const emoticon = parseEmoji(input);

    if (inputName) {
      if (inputName.length < 2) inputName = null;
      else if (inputName.length > 32) inputName = inputName.subString(0, 32);
    }

    if (emoticon.id) {
      if (interaction.guild.emojis.cache.has(emoticon?.id)) return interaction.editReply('That emoji is already on this guild');
      else input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`
    }
    else {
      if (!input.startsWith('http')) input = `https://${input}`;

      if (!urlRegex.test(input)) {
        return interaction.editReply(
          'The provided argument is not a valid url or emoji!\n' +
          'The url must end with `jpg`, `jpeg`, `png`, `webp`, `gif` or `svg`.\n'
        )
      }
      else if (!await urlExists(input)) return interaction.editReply('The provided url was not found.');
    }

    let emoji;
    try {
      emoji = await interaction.guild.emojis.create(
        input, inputName || (emoticon.id ? emoticon.name : 'emoji'),
        { reason: `addemoji command, member ${interaction.user.tag}` }
      )
    }
    catch (err) {
      return interaction.editReply(
        `Unable to create the emoji for reason:\n` +
        '```' + err + '```'
      )
    }
    interaction.editReply(`Successfully added **${emoji.name}**! ${emoji}`);

  }
})