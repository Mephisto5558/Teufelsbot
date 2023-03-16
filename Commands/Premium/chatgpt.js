const
  fetch = require('node-fetch').default,
  { createHash } = require('crypto'),
  { Message, AttachmentBuilder } = require('discord.js');

/**@returns {Promise<String>}*/
async function fetchAPI(lang, deep) {
  const res = await fetch('https://chatgpt-api.shn.hk/v1/', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      model: this.options?.getString('model') ?? 'gpt-3.5-turbo',
      user: createHash('sha256').update(this.user.id).digest('hex'),
      messages: [{ role: 'user', content: this.options?.getString('message') || this.content || lang('hello') }]
    })
  }).then(e => e.text().then(e => JSON.parse(e.slice(e.indexOf('{')))));

  if (!res.error) return res.choices[0].message.content;
  if (res.error.message.startsWith('Rate limit reached') || res.error.message.startsWith('Too many requests')) return deep ? lang('rateLimit') : fetchAPI.call(this, lang, true);

  this.client.error('chatgpt command API error:', res);
  return lang('error');
}

module.exports = {
  name: 'chatgpt',
  aliases: { prefix: ['gpt'] },
  cooldowns: { guild: 0, user: 1000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  premium: true,
  options: [{
    name: 'message',
    type: 'String',
    maxLength: 2000,
    required: true
  }],

  run: async function (lang) {
    if (this instanceof Message) this.channel.sendTyping();

    const message = await fetchAPI.call(this, lang);
    return this.customReply(message.length > 2000 ? { files: [new AttachmentBuilder(Buffer.from(message), { name: 'message.txt' })] } : message, null, { repliedUser: true });
  }
};