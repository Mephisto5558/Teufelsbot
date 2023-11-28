const
  { Message, AttachmentBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType } = require('discord.js'),
  fetch = require('node-fetch').default;

/**@param {lang}lang @param {boolean?}deep @returns {Promise<string>}*/
async function fetchAPI(lang, deep) {
  const res = await fetch('https://api.pawan.krd/v1/chat/completions', { //https://github.com/PawanOsman/ChatGPT
    method: 'POST',
    headers: {
      Authorization: `Bearer ${this.client.keys.chatGPTApiKey}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: this.options?.getString('model') ?? 'gpt-3.5-turbo',
      messages: [{ role: 'user', content: this.options?.getString('message') || this.content || lang('hello') }]
    })
  }).then(e => e.json());

  if (res.choices?.[0].message.content) return res.choices[0].message.content;
  if (['Rate limit reached', 'Too many requests'].some(e => res.error.message.startsWith(e))) return deep ? lang('rateLimit') : fetchAPI.call(this, lang, true);
  if (res.error.type == 'insufficient_quota' || res.error.message.startsWith('That model is currently overloaded') || res.error.type == 'api_not_ready_or_request_error') return lang('notAvailable');

  log.error('chatgpt command API error:', JSON.stringify(res, null, 2));
  return lang('error');
}

/**@type {command}*/
module.exports = {
  name: 'chatgpt',
  aliases: { prefix: ['gpt'] },
  cooldowns: { guild: 0, user: 2000 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  premium: true,
  options: [
    {
      name: 'message',
      type: 'String',
      maxLength: 2000,
      required: true
    },
    {
      name: 'model',
      type: 'String',
      choices: ['gpt-4', 'gpt-4-0613', 'gpt-4-32k', 'gpt-4-32k-0613', 'gpt-3.5-turbo', 'gpt-3.5-turbo-0613', 'gpt-3.5-turbo-16k', 'gpt-3.5-turbo-16k-0613']
    }
  ],

  run: async function (lang) {
    if (this instanceof Message) this.channel.sendTyping();

    const
      content = await fetchAPI.call(this, lang),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('regenerate'),
          customId: `chatgpt.regenerate.${this.options?.getString('model') ?? 'gpt-3.5-turbo'}`,
          style: ButtonStyle.Secondary
        })]
      });

    return (await this.customReply(content.length > 2000 ? { files: [new AttachmentBuilder(Buffer.from(content), { name: 'message.txt' })], components: [component] } : { content, components: [component] }, null, { repliedUser: true }))
      .createMessageComponentCollector({ componentType: ComponentType.Button, filter: e => e.user.id == this.user.id })
      .on('collect', async e => {
        const reply = await e.deferReply();

        const newContent = await fetchAPI.call(this, lang);
        e.message.edit(newContent.length > 2000 ? { files: [new AttachmentBuilder(Buffer.from(newContent), { name: 'message.txt' })] } : newContent);
        reply.delete();
      });
  }
};