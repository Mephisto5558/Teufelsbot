/** @import { chatgpt_fetchAPI } from '.' */

const
  { ButtonInteraction, ChatInputCommandInteraction, cleanContent } = require('discord.js'),
  fetch = require('node-fetch').default,
  { JSON_SPACES } = require('../constants'),
  getCommands = require('../getCommands'),

  DEFAULT_MODEL = 'gpt-oss-20b',
  RATE_LIMIT_MSGS = ['Rate limit reached', 'Too many requests'],
  AI_MESSAGE_CONTEXT = 50,

  /** @type {(client: Client) => string} */
  getCommandList = client => getCommands.call(client, client.i18n.getTranslator({ undefinedNotFound: true, locale: 'en' }))
    .map(category => {
      const commands = category.list.map(cmd => `- ${cmd.commandName}: ${cmd.commandDescription.replaceAll('\n', ' ')}`).join('\n');
      return `**${category.category}**: ${category.subTitle}\n${commands}`;
    })
    .join('\n\n'),

  /** @type {(client: Interaction | Message | ButtonInteraction) => string} */
  getSystemPrompt = interaction => [
    // Core Identity
    `You are ${interaction.client.user.username}, a mischievous but helpful Discord bot with a devilish charm.`,
    'Your personality is witty and a bit sarcastic, but you always provide helpful and accurate answers.',

    // Rules of Engagement
    'Your answers must be concise and to the point. Use Discord markdown for clarity, but do not overuse it.',
    'Use emojis very sparingly. Always respond in the language of the user\'s message.',
    'Never mimic the user message format (e.g., "Username: message"). Your responses must be natural.',

    // Context Awareness
    `You are in the Discord guild "${interaction.guild.name}".`,
    interaction.inGuild() ? `The current channel is named "${interaction.channel.name}".` : 'You are currently in a DM conversation.',
    `You have access to the last ${AI_MESSAGE_CONTEXT} messages in this channel for context. User messages are prefixed with their username.`,

    // Bot Knowledge
    'If a user asks for help with a task you can perform, guide them to the correct command.',
    `Your available commands are:\n${getCommandList(interaction.client)}`,
    'The list above does not include commands that are only for developers.',
    `Your creator is ${interaction.client.config.github.userName ?? 'Mephisto5558'} and your GitHub repo is at ${interaction.client.config.github.repo ?? 'https://github.com/Mephisto5558/Teufelsbot'}.`,
    interaction.client.config.discordInvite ? `The invite link to the support server is ${interaction.client.config.discordInvite}` : '',
    `You were created on ${interaction.client.application.createdAt.toISOString()}.`
  ].filter(Boolean).join('\n'),

  /** @type {(err: { type: string, message: string }) => boolean} */
  isUnavailable = err => ['insufficient_quota', 'api_not_ready_or_request_error'].includes(err.type)
    || err.message.startsWith('That model is currently overloaded');

/** @type {(message: Interaction | Message) => string} */
function createUserName(message) {
  const member = message.member ?? message.user;
  return message.user.username
    + (message.user.username == member.displayName ? '' : ` (${member.displayName})`)
    + `${message.client.config.devIds.has(message.user.id) ? ' [DEV]' : ''}: `;
}

/**
 * @param {Message | Interaction | ButtonInteraction<undefined>} interaction
 * @param {string} prompt */
const createContext = async (interaction, prompt) => [
  { role: 'system', content: getSystemPrompt(interaction) },
  ...(await interaction.channel.messages.fetch({ limit: AI_MESSAGE_CONTEXT })).filter(e => e.id != interaction.id).reverse().map(msg => {
    let content = msg.cleanContent;
    if (!content) {
      if (msg.embeds.length) content = `<Embed>:${msg.embeds.map(e => cleanContent(e.description, interaction.channel)).join('\n')}`;
      else if (msg.attachments.size) content = '<Attachments>';

      content ||= '<unknown content>';
    }

    return {
      role: (msg.user.id == interaction.client.user.id) ? 'assistant' : 'user',
      content: createUserName(msg) + content
    };
  }),
  { role: 'user', content: createUserName(interaction) + cleanContent(prompt, interaction.channel) }
];


/** @type {chatgpt_fetchAPI} */
module.exports = async function fetchAPI(lang, model = DEFAULT_MODEL, deep = false) {
  let prompt;
  if (this instanceof ButtonInteraction) prompt = (await this.message.fetchReference()).content;
  else if (this instanceof ChatInputCommandInteraction) prompt = this.options.getString('message', true);
  else prompt = this.content;
  const messages = await createContext(this, prompt),

    /** @type {{ choices: { message: { content: string } }[] } | { error: { message: string, type: string } }} */
    res = await fetch('https://api.pawan.krd/v1/chat/completions', { // https://github.com/PawanOsman/ChatGPT
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
      return deep ? [lang('rateLimit'), model] : fetchAPI.call(this, lang, model, true);
    if (isUnavailable(res.error)) return [lang('notAvailable'), model];
  }

  if ('choices' in res && res.choices[0].message.content) return [res.choices[0].message.content, model];

  log.error('chatgpt command API error:', JSON.stringify(res, undefined, JSON_SPACES));
  return [lang('error'), model];
};