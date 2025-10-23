const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Message } = require('discord.js'),
  fetch = require('node-fetch').default,
  { constants: { messageMaxLength, JSON_SPACES }, timeFormatter: { msInSecond } } = require('#Utils'),

  RATE_LIMIT_MSGS = ['Rate limit reached', 'Too many requests'],

  /** @type {(err: { type: string, message: string }) => boolean} */
  isUnavailable = err => ['insufficient_quota', 'api_not_ready_or_request_error'].includes(err.type)
    || err.message.startsWith('That model is currently overloaded');

/**
 * @this {Interaction | Message}
 * @param {lang} lang
 * @param {boolean?} deep
 * @returns {Promise<string>} */
async function fetchAPI(lang, deep) {
  /** @type {{ choices: { message: { content: string } }[] } | { error: { message: string, type: string } }} */
  const res = await fetch('https://api.pawan.krd/v1/chat/completions', { // https://github.com/PawanOsman/ChatGPT
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.chatGPTApiKey}`,
      'User-Agent': `Discord Bot ${this.client.application.name ?? ''} (${this.client.config.github.repo ?? ''})`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({
      model: 'pai-001',
      messages: [
        { role: 'system', content: 'Your name is "Teufelsbot", you are a helpful discord bot. Reply consize and in the same language as the user.' },
        { role: 'user', content: this.options?.getString('message', true) ?? this.content }
      ]
    })
  }).then(async e => e.json());

  if ('error' in res) {
    if (RATE_LIMIT_MSGS.some(e => res.error.message.startsWith(e)))
      return deep ? lang('rateLimit') : fetchAPI.call(this, lang, true);
    if (isUnavailable(res.error))
      return lang('notAvailable');
  }

  if ('choices' in res && res.choices[0].message.content) return res.choices[0].message.content;

  log.error('chatgpt command API error:', JSON.stringify(res, undefined, JSON_SPACES));
  return lang('error');
}

/** @type {command<'both', false>} */
module.exports = {
  aliases: { prefix: ['gpt'] },
  cooldowns: { user: msInSecond * 2 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  premium: true,
  options: [{
    name: 'message',
    type: 'String',
    maxLength: messageMaxLength,
    required: true
  }],

  async run(lang) {
    if (this instanceof Message && 'sendTyping' in this.channel) void this.channel.sendTyping();

    const
      content = await fetchAPI.call(this, lang),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('regenerate'),
          customId: 'chatgpt.regenerate.pai-001',
          style: ButtonStyle.Secondary
        })]
      });

    return (await this.customReply({ content, components: [component] }, undefined, { repliedUser: true }))
      .createMessageComponentCollector({ componentType: ComponentType.Button, filter: e => e.user.id == this.user.id })
      .on('collect', async e => {
        const
          reply = await e.deferReply(),
          newContent = await fetchAPI.call(this, lang);

        void e.message.edit(newContent);
        return reply.delete();
      });
  }
};