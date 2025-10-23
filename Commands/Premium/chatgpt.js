const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Message, cleanContent } = require('discord.js'),
  fetch = require('node-fetch').default,
  { constants: { messageMaxLength }, timeFormatter: { msInSecond } } = require('#Utils'),

  model = 'gpt-oss-20b',
  RATE_LIMIT_MSGS = ['Rate limit reached', 'Too many requests'],
  AI_MESSAGE_CONTEXT = 50,

  /** @type {(err: { type: string, message: string }) => boolean} */
  isUnavailable = err => ['insufficient_quota', 'api_not_ready_or_request_error'].includes(err.type)
    || err.message.startsWith('That model is currently overloaded');

/** @type {(message: Interaction | Message) => string} */
function createUserName(message) {
  const { displayName } = message.member ?? message.user;

  return `${displayName == message.user.username ? '' : message.user.username + ' '}${displayName}`
    + ` ${message.client.config.devIds.has(message.user.id) ? ' [DEV]' : ''}): `;
}

/**
 * @this {Interaction | Message}
 * @param {lang} lang
 * @param {boolean?} deep
 * @returns {Promise<string>} */
async function fetchAPI(lang, deep) {
  const
    prompt = this.options?.getString('message', true) ?? this.content,
    messages = [
      {
        role: 'system',
        /* eslint-disable @stylistic/max-len */
        content: `You are ${this.client.user.username}, a mischievous but helpful Discord bot with a devilish charm. Your personality is witty and a bit sarcastic, but you always provide helpful and accurate answers. `
          + 'Keep your answers concise and to the point, using Discord markdown for formatting when it improves clarity (but not overdoing it). Always respond in the same language as the user\'s message unless prompted otherwise.'
          + ` You always know the last ${AI_MESSAGE_CONTEXT} messages of the channel you\'re in. Your creator is ${this.client.config.github.userName ?? 'Mephisto5558'} and your GitHub repo is at ${this.client.config.github.repo ?? 'https://github.com/Mephisto5558/Teufelsbot'}.`
        /* eslint-enable @stylistic/max-len */
      }
    ];

  for (const [,message] of await this.channel.messages.fetch({ limit: AI_MESSAGE_CONTEXT })) {
    const role = (message.user.id == this.client.user.id) ? 'assistant' : 'user';

    let content = message.cleanContent;
    if (!content) {
      if (message.embeds.length) content = `<Embed>:${message.embeds.map(e => e.description).join('\n')}`;
      else if (message.attachments.size) content = '<Attachments>';

      content ||= '<unknown content>';
    }

    messages.push({ role, content: createUserName(message) + content });
  }

  messages.push({ role: 'user', content: createUserName(this) + cleanContent(prompt) });


  /** @type {{ choices: { message: { content: string } }[] } | { error: { message: string, type: string } }} */
  const res = await fetch('https://api.pawan.krd/v1/chat/completions', { // https://github.com/PawanOsman/ChatGPT
    method: 'POST',
    headers: {
      Authorization: `Bearer ${process.env.chatGPTApiKey}`,
      'User-Agent': `Discord Bot ${this.client.application.name ?? ''} (${this.client.config.github.repo ?? ''})`,
      'Content-Type': 'application/json',
      Accept: 'application/json'
    },
    body: JSON.stringify({ model, messages })
  }).then(async e => e.json());

  if ('error' in res) {
    if (RATE_LIMIT_MSGS.some(e => res.error.message.startsWith(e)))
      return deep ? lang('rateLimit') : fetchAPI.call(this, lang, true);
    if (isUnavailable(res.error))
      return lang('notAvailable');
  }

  if ('choices' in res && res.choices[0].message.content) return res.choices[0].message.content;

  log.error('chatgpt command API error:', JSON.stringify(res, undefined, 2));
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
          customId: `chatgpt.regenerate.${model}`,
          style: ButtonStyle.Secondary
        })]
      });

    // TODO finally move this to keep it after restarts
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