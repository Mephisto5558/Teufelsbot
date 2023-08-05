const
  { parseEmoji, EmbedBuilder, Colors } = require('discord.js'),
  http = require('http'),
  https = require('https'),
  url = require('url');

/**@param {string}urlStr @returns {Promise<boolean|Error|string>}*/
const checkUrl = urlStr => new Promise((resolve, reject) => {
  const req = (urlStr.startsWith('https') ? https : http).request({ ...url.parse(urlStr), method: 'HEAD', timeout: 5000 }, res => resolve(res.statusCode > 199 && res.statusCode < 400 ? true : false));

  req
    .on('timeout', () => req.destroy({ name: 'AbortError', message: 'Request timed out' }))
    .on('error', err => reject(err))
    .end();
});

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
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

    if (this.guild.emojis.cache.has(emoticon.id)) return this.editReply({ embeds: [embed.setDescription(lang('isGuildEmoji'))] });
    if (emoticon.id) input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`;
    else if (!/^(https?:\/\/)?(www\.)?.*\.(jpg|jpeg|png|webp|svg|gif)(\?.*)?$/i.test(input)) return this.editReply({ embeds: [embed.setDescription(lang('invalidUrl'))] });
    if (!input.startsWith('http')) input = `https://${input}`;

    try {
      if (!(await checkUrl(input))) return this.editReply({ embeds: [embed.setDescription(lang('notFound'))] });

      const emoji = await this.guild.emojis.create({
        attachment: input, name,
        reason: lang('global.modReason', { command: this.commandName, user: this.user.username }),
        roles: limitToRoles
      });

      embed.data.description = lang('success', { name: emoji.name, emoji });
      if (limitToRoles?.length) embed.data.description += lang('limitedToRoles', `<@&${limitToRoles.join('>, <@&')}>`);
    }
    catch (err) {
      // TODO: Prevent DiscordAPIError[50035]: "Invalid Form Body image[BINARY_TYPE_MAX_SIZE]: File cannot be larger than 2048.0 kb."
      if (!['DiscordAPIError[30008]', 'DiscordAPIError[50035]', 'AbortError'].includes(err.name)) throw err;
      embed.data.description = lang('error', err.name == 'AbortError' ? lang('timedOut') : err.message);
    }

    return this.editReply({ embeds: [embed.setColor(Colors.Green)] });
  }
};
