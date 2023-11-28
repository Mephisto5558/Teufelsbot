const
  { parseEmoji, EmbedBuilder, Colors } = require('discord.js'),
  http = require('http'),
  https = require('https');

/**@param {string}url @returns {Promise<boolean|Error|string>}*/
const checkUrl = url => new Promise((resolve, reject) => {
  const req = (url.startsWith('https') ? https : http).request(url, { method: 'HEAD', timeout: 5000 }, res => resolve(res.statusCode > 199 && res.statusCode < 400));

  req
    .on('timeout', () => req.destroy({ name: 'AbortError', message: 'Request timed out' }))
    .on('error', err => reject(err))
    .end();
});

/**@type {command}*/
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

  /**@this GuildInteraction*/
  run: async function (lang) {
    let input = this.options.getString('emoji_or_url');

    const
      limitToRoles = this.options.getString('limit_to_roles')?.split(' ').map(e => e.replace(/\D/g, '')).filter(e => this.guild.roles.cache.has(e)),
      emoticon = parseEmoji(input),
      name = this.options.getString('name')?.slice(0, 32) || (emoticon.id ? emoticon.name : 'emoji'),
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

    if (this.guild.emojis.cache.has(emoticon.id)) return this.editReply({ embeds: [embed.setDescription(lang('isGuildEmoji'))] });
    if (emoticon.id) input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`;
    else if (!/^(https?:\/\/)?(www\.)?.*\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(input)) return this.editReply({ embeds: [embed.setDescription(lang('invalidUrl'))] });
    if (!input.startsWith('http')) input = `https://${input}`;

    try {
      if (!(await checkUrl(input))) return this.editReply({ embeds: [embed.setDescription(lang('notFound'))] });

      const emoji = await this.guild.emojis.create({
        attachment: input, name,
        reason: lang('global.modReason', { command: this.commandName, user: this.user.tag }),
        roles: limitToRoles
      });

      embed.data.description = lang('success', { name: emoji.name, emoji });
      if (limitToRoles?.length) embed.data.description += lang('limitedToRoles', `<@&${limitToRoles.join('>, <@&')}>`);
    }
    catch (err) {
      if (err.message.includes('image[BINARY_TYPE_MAX_SIZE]'))
        embed.data.description = lang('error', lang('tooBig'));
      else if (!['DiscordAPIError[30008]', 'AbortError', 'ConnectTimeoutError'].includes(err.name)) throw err;
      
      embed.data.description = lang('error', err.name == 'AbortError' || err.name == 'ConnectTimeoutError' ? lang('timedOut') : err.message);
    }

    return this.editReply({ embeds: [embed.setColor(Colors.Green)] });
  }
};