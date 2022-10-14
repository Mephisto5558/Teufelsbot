const
  { parseEmoji, EmbedBuilder, Colors } = require('discord.js'),
  { head } = require('axios');

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

  run: async function (lang) {
    let input = this.options.getString('emoji_or_url');

    const
      limitToRoles = this.options.getString('limit_to_roles')?.split(' ').map(e => e.replace(/\D/g, '')).filter(e => this.guild.roles.cache.has(e)),
      emoticon = parseEmoji(input),
      name = this.options.getString('name')?.slice(0, 32) || (emoticon.id ? emoticon.name : 'emoji'),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        color: Colors.Green
      }),
      sendEmbed = desc => {
        embed.data.description = desc;
        this.editReply({ embeds: [embed] });
      };

    if (this.guild.emojis.cache.has(emoticon.id)) return sendEmbed(lang('isGuildEmoji'));
    if (emoticon.id) input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`;
    else if (!/^(?:https?:\/\/)?(?:www\.)?.*\.(?:jpg|jpeg|png|webp|svg|gif)(?:\?.*)?$/i.test(input))
      return sendEmbed(lang('invalidUrl'));
    if (!input.startsWith('http')) input = `https://${input}`;
    if (/4\d\d/.test((await head(input)).status)) return sendEmbed(lang('notFound'));

    try {
      const emoji = await this.guild.emojis.create({
        attachment: input, name,
        reason: `addemoji command, member ${this.user.tag}`,
        roles: limitToRoles
      });

      embed.data.description = lang('success', { name: emoji.name, emoji });
      if (limitToRoles?.length) embed.data.description += lang('limitedToRoles', limitToRoles.join('>, <@&'));
    }
    catch (err) {
      if (err.name != 'DiscordAPIError[30008]') throw err;

      embed.data.color = Colors.Red;
      embed.data.description = lang('error', err.name == 'AbortError' ? lang('timedOut') : err.message);
    }

    this.editReply({ embeds: [embed] });
  }
};