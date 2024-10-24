const
  { parseEmoji, EmbedBuilder, Colors } = require('discord.js'),
  http = require('node:http'),
  https = require('node:https'),
  { DiscordAPIErrorCodes } = require('#Utils');

/** @param {string}url @returns {Promise<boolean>}*/
const checkUrl = url => new Promise((resolve, reject) => {
  /* eslint-disable-next-line sonarjs/sonar-no-magic-numbers -- status codes 2xx and 3xx*/
  const req = (url.startsWith('https') ? https : http).request(url, { method: 'HEAD', timeout: 5000 }, res => resolve(res.statusCode.inRange(199, 400)));

  req
    .on('timeout', () => req.destroy({ name: 'AbortError', message: 'Request timed out' }))
    .on('error', err => reject(err))
    .end();
});

/** @type {command<'slash'>}*/
module.exports = {
  permissions: { client: ['ManageGuildExpressions'], user: ['ManageGuildExpressions'] },
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

  async run(lang) {
    let input = this.options.getString('emoji_or_url', true);

    const
      limitToRoles = this.options.getString('limit_to_roles')?.split(' ').reduce((acc, e) => {
        const id = e.replaceAll(/\D/g, '');
        if (this.guild.roles.cache.has(id)) acc.push(id);
        return acc;
      }, []),
      emoticon = parseEmoji(input),
      name = this.options.getString('name')?.slice(0, 32) ?? (emoticon.id ? emoticon.name : 'emoji'),
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

    if (this.guild.emojis.cache.has(emoticon.id)) return this.editReply({ embeds: [embed.setDescription(lang('isGuildEmoji'))] });
    if (emoticon.id) input = `https://cdn.discordapp.com/emojis/${emoticon.id}.${emoticon.animated ? 'gif' : 'png'}`;
    /* eslint-disable-next-line regexp/prefer-quantifier -- "www" is preferred to be written out for readability*/
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

      embed.data.description = lang('success', { name: emoji.name, emoji });
      if (limitToRoles?.length > 0) embed.data.description += lang('limitedToRoles', `<@&${limitToRoles.join('>, <@&')}>`);
    }
    catch (err) {
      if (err.message.includes('image[BINARY_TYPE_MAX_SIZE]')) // no check by err.code because it is just 50035 ("Invalid form body")
        embed.data.description = lang('error', lang('tooBig'));
      else if (err.code != DiscordAPIErrorCodes.MaximumNumberOfEmojisReached && err.name != 'AbortError' && err.name != 'ConnectTimeoutError') throw err;

      embed.data.description = lang('error', err.name == 'AbortError' || err.name == 'ConnectTimeoutError' ? lang('timedOut') : err.message);
    }

    return this.editReply({ embeds: [embed.setColor(Colors.Green)] });
  }
};