import { cleanContent } from 'discord.js';
import { getCommands, isComponent, isSlash } from '@mephisto5558/command';
import fetch from 'node-fetch';
import { JSON_SPACES, commonHeaders } from '../constants.ts';
import type { ButtonInteraction } from 'discord.js';

const
  DEFAULT_MODEL = 'gpt-oss-20b',
  RATE_LIMIT_MSGS = ['Rate limit reached', 'Too many requests'],
  AI_MESSAGE_CONTEXT = 50,

  getCommandList = (client: Client): string => getCommands.call(client, client.i18n.getTranslator({ undefinedNotFound: true, locale: 'en' }))
    .map(category => {
      const commands = category.list.map(cmd => `- ${cmd.commandName}: ${cmd.commandDescription.replaceAll('\n', ' ')}`).join('\n');
      return `**${category.category}**: ${category.subTitle}\n${commands}`;
    })
    .join('\n\n'),

  getSystemPrompt = (interaction: Interaction | Message | ButtonInteraction): string => [
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

  isUnavailable = (err: { type: string; message: string }): boolean => ['insufficient_quota', 'api_not_ready_or_request_error'].includes(err.type)
    || err.message.startsWith('That model is currently overloaded');

function createUserName(message: Interaction | Message): string {
  const member = message.member ?? message.user;
  return `[${message.createdAt.toISOString()}] `
    + message.user.username
    + (message.user.username == member.displayName ? '' : ` (${member.displayName})`)
    + `${message.client.config.devIds.has(message.user.id) ? ' [DEV]' : ''}: `;
}

const createContext = async (interaction: Message | Interaction | ButtonInteraction<undefined>, prompt: string) => [
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


export default async function fetchAPI<
  MODEL extends string
>(
  this: Interaction | Message | ButtonInteraction<undefined>,
  lang: lang, model: MODEL = DEFAULT_MODEL as MODEL, deep = false
): Promise<[string, MODEL]> {
  let prompt;
  if (isComponent(this) && this.isButton()) prompt = (await this.message.fetchReference()).content;
  else if (isSlash(this)) prompt = this.options.getString('message', true);
  else prompt = this.content;
  const 
    messages = await createContext(this, prompt),
    res = await fetch('https://api.pawan.krd/v1/chat/completions', { // https://github.com/PawanOsman/ChatGPT
      method: 'POST',
      headers: {
        ...commonHeaders(this.client, true),
        Authorization: `Bearer ${process.env.chatGPTApiKey}`
      },
      body: JSON.stringify({ model, messages })
    }).then(async e => e.json()) as { choices: { message: { content: string } }[] } | { error: { message: string, type: string } };

  if ('error' in res) {
    if (RATE_LIMIT_MSGS.some(e => res.error.message.startsWith(e)))
      return deep ? [lang('rateLimit'), model] : fetchAPI.call(this, lang, model, true);
    if (isUnavailable(res.error)) return [lang('notAvailable'), model];
  }

  if ('choices' in res && res.choices[0].message.content) return [res.choices[0].message.content, model];

  log.error('chatgpt command API error:', JSON.stringify(res, undefined, JSON_SPACES));
  return [lang('error'), model];
}