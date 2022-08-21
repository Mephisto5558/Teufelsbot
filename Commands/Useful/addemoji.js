const
  { Command } = require('reconlx'),
  { parseEmoji, EmbedBuilder, Colors } = require('discord.js'),
  { head } = require('axios').default;

module.exports = new Command({
  name: 'addemoji',
  aliases: { prefix: [], slash: [] },
  description: 'adds a emoji to your guild.',
  usage: '',
  permissions: {
    client: ['ManageEmojisAndStickers'],
    user: ['ManageEmojisAndStickers']
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
      minLength: 2,
      maxLength: 32,
      required: false
    },
    {
      name: 'limit_to_roles',
      description: 'the role(s) that are allowed to use the emoji. Separate them with spaces',
      type: 'String',
      required: false
    }
  ],

  run: async (interaction, lang) => {
    let input = interaction.options.getString('emoji_or_url');

    const
      limitToRoles = interaction.options.getString('limit_to_roles')?.split(' ').map(e => e.replace(/[^\d]/g, '')).filter(e => interaction.guild.roles.cache.has(e)),
      emoticon = parseEmoji(input),
      emojiName = interaction.options.getString('name')?.slice(0, 32) || emoticon.id ? emoticon.name : 'emoji',
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        color: Colors.Green
      });

    if (interaction.guild.emojis.cache.has(emoticon.id)) embed.data.description = lang('isGuildEmoji');
    else if (emoticon.id) input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`;
    else {
      if (!input.startsWith('http')) input = `https://${input}`;
      if (!/^(?:https?:\/\/)?(?:www\.)?.*\.(?:jpg|jpeg|png|webp|svg|gif)(?:\?.*)?$/i.test(input))
        embed.data.description = lang('invalidUrl');

      try {
        const res = await head(input);
        if (/4\d\d/.test(res.status)) throw Error('notFound');
      }
      catch (err) {
        if (err.message == 'notFound') embed.data.description = lang('notFound');
        else throw err;
      }
    }

    if (embed.data.description) return interaction.editReply({ embeds: [embed] });

    try {
      const emoji = await interaction.guild.emojis.create({
        attachment: input,
        name: emojiName,
        reason: `addemoji command, member ${interaction.user.tag}`,
        roles: limitToRoles
      });

      embed.data.description = lang('success', emoji.name, emoji);
      if (limitToRoles?.length) embed.data.description += lang('limitedToRoles', limitToRoles.join('>, <@&'));
    }
    catch (err) {
      embed.data.color = Colors.Red;
      embed.data.description = lang('error', err.name == 'AbortError' ? lang('timedOut') : err);
    }

    interaction.editReply({ embeds: [embed] });
  }
})