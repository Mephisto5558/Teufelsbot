const
  { parseEmoji, EmbedBuilder, Colors } = require('discord.js'),
  http = require('http'),
  https = require('https'),
  url = require('url');

function checkUrl(urlStr) {
  return new Promise((resolve, reject) => {
    const { protocol, host, path } = url.parse(urlStr);

    (protocol == 'https:' ? https : http)
      .request({ host, path, method: 'HEAD' }, res => resolve(res.statusCode >= 200 && res.statusCode < 400 ? true : false))
      .on('error', err => reject(err))
      .end();
  });
}

module.exports = {
  name: 'addemoji',
  permissions: { client: ['ManageEmojisAndStickers'], user: ['ManageEmojisAndStickers'] },
  cooldowns: { user: 2000 },
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
        color: Colors.Red
      });

    if (this.guild.emojis.cache.has(emoticon.id)) return this.editReply({ embeds: [embed.setDescription(lang('isGuildEmoji'))] });
    if (emoticon.id) input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`;
    else if (!/^(https?:\/\/)?(www\.)?.*\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(input)) return this.editReply({ embeds: [embed.setDescription(lang('invalidUrl'))] });
    if (!input.startsWith('http')) input = `https://${input}`;
    if (!(await checkUrl(input))) return this.editReply({ embeds: [embed.setDescription(lang('notFound'))] });

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
      embed.data.description = lang('error', err.name == 'AbortError' ? lang('timedOut') : err.message);
    }

    return this.editReply({ embeds: [embed.setColor(Colors.Green)] });
  }
};