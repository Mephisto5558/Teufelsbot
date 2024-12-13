const
  { parseEmoji, EmbedBuilder, Colors, codeBlock, roleMention, CDNRoutes, ImageFormat, bold } = require('discord.js'),
  http = require('node:http'),
  https = require('node:https'),
  { DiscordAPIErrorCodes, timeFormatter: { msInSecond }, constants: { emojiNameMinLength, emojiNameMaxLength } } = require('#Utils');

/** @param {string}url @returns {Promise<boolean>} */
const checkUrl = url => new Promise((resolve, reject) => {
  /* eslint-disable-next-line @typescript-eslint/no-magic-numbers -- status codes 2xx and 3xx */
  const req = (url.startsWith('https') ? https : http).request(url, { method: 'HEAD', timeout: msInSecond * 5 }, res => resolve(res.statusCode.inRange(199, 400)));

  req
    .on('timeout', () => req.destroy({ name: 'AbortError', message: 'Request timed out' }))
    .on('error', err => reject(err))
    .end();
});

/** @type {command<'slash'>} */
module.exports = {
  permissions: { client: ['ManageGuildExpressions'], user: ['ManageGuildExpressions'] },
  cooldowns: { user: msInSecond * 2 },
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
      minLength: emojiNameMinLength,
      maxLength: emojiNameMaxLength
    },
    { name: 'limit_to_roles', type: 'String' }
  ],

  async run(lang) {
    let input = this.options.getString('emoji_or_url', true);

    const
      limitToRoles = this.options.getString('limit_to_roles')?.split(' ').reduce((acc, e) => {
        const id = e.replaceAll(/\D/g, '');
        if (this.guild.roles.cache.has(id)) acc.push(id);
        return acc;
      }, []),
      emoticon = parseEmoji(input),
      name = this.options.getString('name') ?? (emoticon.id ? emoticon.name : 'emoji'),
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

    if (this.guild.emojis.cache.has(emoticon.id)) return this.editReply({ embeds: [embed.setDescription(lang('isGuildEmoji'))] });
    if (emoticon.id) input = `https://cdn.discordapp.com/${CDNRoutes.emoji(emoticon.id, emoticon.animated ? ImageFormat.GIF : ImageFormat.PNG)}`;
    /* eslint-disable-next-line regexp/prefer-quantifier -- "www" is preferred to be written out for readability */
    else if (!/^(?:https?:\/\/)?(?:www\.)?.*?\.(?:gif|jpeg|jpg|png|svg|webp)(?:\?.*)?$/i.test(input))
      return this.editReply({ embeds: [embed.setDescription(lang('invalidUrl'))] });
    if (!input.startsWith('http')) input = `https://${input}`;

    try {
      if (!await checkUrl(input)) return this.editReply({ embeds: [embed.setDescription(lang('notFound'))] });

      const emoji = await this.guild.emojis.create({
        name, attachment: input,
        reason: lang('global.modReason', { command: this.commandName, user: this.user.tag }),
        roles: limitToRoles
      });

      embed.data.description = lang('success', { name: bold(emoji.name), emoji });
      if (limitToRoles?.length > 0) embed.data.description += lang('limitedToRoles', limitToRoles.map(roleMention).join(', '));
    }
    catch (err) {
      if (err.message.includes('image[BINARY_TYPE_MAX_SIZE]')) // no check by err.code because it is just 50035 ("Invalid form body")
        embed.data.description = lang('error', codeBlock(lang('tooBig')));
      else if (err.code != DiscordAPIErrorCodes.MaximumNumberOfEmojisReached && err.name != 'AbortError' && err.name != 'ConnectTimeoutError') throw err;

      embed.data.description = lang('error', codeBlock(err.name == 'AbortError' || err.name == 'ConnectTimeoutError' ? lang('timedOut') : err.message));
    }

    return this.editReply({ embeds: [embed.setColor(Colors.Green)] });
  }
};