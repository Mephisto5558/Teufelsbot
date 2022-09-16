const
  { parseEmoji, EmbedBuilder, Colors } = require('discord.js'),
  { head } = require('axios').default;

module.exports = {
  name: 'addemoji',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['ManageEmojisAndStickers'], user: ['ManageEmojisAndStickers'] },
  cooldowns: { guild: 0, user: 2000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'emoji_or_url',
      type: 'String',
      required: true
    },
    {
      name: 'name',
      type: 'String',
      minLength: 2,
      maxLength: 32
    },
    { name: 'limit_to_roles', type: 'String' }
  ],

  run: async (interaction, lang) => {
    let input = interaction.options.getString('emoji_or_url');

    const
      limitToRoles = interaction.options.getString('limit_to_roles')?.split(' ').map(e => e.replace(/\D/g, '')).filter(e => interaction.guild.roles.cache.has(e)),
      emoticon = parseEmoji(input),
      name = interaction.options.getString('name')?.slice(0, 32) || emoticon.id ? emoticon.name : 'emoji',
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

      const res = await head(input);
      if (/4\d\d/.test(res.status)) embed.data.description = lang('notFound');
    }

    if (embed.data.description) return interaction.editReply({ embeds: [embed] });

    try {
      const emoji = await interaction.guild.emojis.create({
        attachment: input, name,
        reason: `addemoji command, member ${interaction.user.tag}`,
        roles: limitToRoles
      });

      embed.data.description = lang('success', { name: emoji.name, emoji });
      if (limitToRoles?.length) embed.data.description += lang('limitedToRoles', limitToRoles.join('>, <@&'));
    }
    catch (err) {
      if(err.name != 'DiscordAPIError[30008]') throw err;

      embed.data.color = Colors.Red;
      embed.data.description = lang('error', err.name == 'AbortError' ? lang('timedOut') : err.message);
    }

    interaction.editReply({ embeds: [embed] });
  }
}