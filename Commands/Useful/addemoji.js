const
  { Command } = require('reconlx'),
  { Util, EmbedBuilder } = require('discord.js'),
  { colors } = require('../../Settings/embed.json'),
  { head } = require('axios').default;

module.exports = new Command({
  name: 'addemoji',
  aliases: { prefix: [], slash: [] },
  description: 'adds a emoji to your guild.',
  usage: '',
  permissions: {
    client: ['MANAGE_EMOJIS_AND_STICKERS', 'EMBED_LINKS'],
    user: ['MANAGE_EMOJIS_AND_STICKERS']
  },
  cooldowns: { guild: 0, user: 2000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'emoji_or_url',
      description: 'provide an emoji or a url to a picture.',
      type: 'String',
      required: true
    },
    {
      name: 'name',
      description: 'the name of the new emoji (min 2, max 32 chars)',
      type: 'String',
      required: false
    },
    {
      name: 'limit_to_roles',
      description: 'the role(s) that are allowed to use the emoji. Separate them with spaces',
      type: 'String',
      required: false
    }
  ],

  run: async (_, __, interaction) => {
    let input = interaction.options.getString('emoji_or_url');

    const
      emojiName = interaction.options.getString('name')?.slice(0, 32),
      limitToRoles = interaction.options.getString('limit_to_roles')?.replace(/[^0-9\s]/g, '').split(' ').filter(e => interaction.guild.roles.cache.has(e)),
      emoticon = Util.parseEmoji(input),
      embed = new EmbedBuilder({
        title: 'Add Emoji',
        color: colors.discord.RED
      });

    if (interaction.guild.emojis.cache.has(emoticon.id)) embed.description = 'That emoji is already on this guild!';
    else if (emoticon.id) input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`;
    else {
      if (!input.startsWith('http')) input = `https://${input}`;
      if (!/^.+\.(?:jpg|jpeg|png|webp|gif|svg)$/i.test(input)) {
        embed.description =
          'The provided argument is not a valid url or emoji!\n' +
          'The url must end with `jpg`, `jpeg`, `png`, `webp`, `gif` or `svg`.';
      }

      try {
        const res = await head(input);
        if (/4\d\d/.test(res.status)) throw Error();
      }
      catch {
        embed.description = 'The provided url was not found.'
      }
    }

    if (embed.description) return interaction.editReply({ embeds: [embed] });

    try {
      const emoji = await interaction.guild.emojis.create({
        attachment: input,
        name: emojiName?.length < 2 ? 'emoji' : emojiName, 
        reason: `addemoji command, member ${interaction.user.tag}`,
        roles: limitToRoles
      });

      embed.description =
        `Successfully added **${emoji.name}** ${emoji}!\n` +
        (limitToRoles.length ? `The emoji has been limited to the following roles:\n<@&${limitToRoles.join('>, <@&')}>` : '');
    }
    catch (err) {
      embed.description = `Unable to create the emoji for reason:\n`;

      if (err.name == 'AbortError') embed.description += '> The request timed out. Maybe the image is to large.';
      else embed.description += '```' + err + '```';
    }

    interaction.editReply({ embeds: [embed] });
  }
})