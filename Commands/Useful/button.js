const
  { ActionRow, ActionRowBuilder, ButtonBuilder, ButtonStyle, codeBlock } = require('discord.js'),
  { Command, commandTypes } = require('@mephisto5558/command'),
  {
    DiscordAPIErrorCodes, timeFormatter: { msInSecond }, filterEmptyEntries,
    constants: { buttonLabelMaxLength, buttonURLMaxLength, messageActionRowMaxAmt, actionRowButtonMaxAmt }
  } = require('#Utils');

/**
 * @this {ThisParameterType<NonNullable<(typeof module.exports)['run']>>}
 * @param {Snowflake} msgId
 * @param {lang} lang */
async function getEditableMessage(msgId, lang) {
  let msg;

  try { msg = await this.channel.messages.fetch(msgId); }
  catch (err) {
    if (err.code != DiscordAPIErrorCodes.UnknownMessage) throw err;
    return void this.editReply(lang('msgNotFound'));
  }

  if (msg.user.id != this.client.user.id) return void this.editReply(lang('botIsNotAuthor'));

  const lastComponent = msg.components[messageActionRowMaxAmt - 1];
  if (
    msg.components.length >= messageActionRowMaxAmt && this.options.getBoolean('new_row') || (
      lastComponent instanceof ActionRow && lastComponent.components.length >= actionRowButtonMaxAmt
    )
  ) return void this.editReply(lang('buttonLimitReached'));

  return msg;
}

/**
 * @this {ThisParameterType<NonNullable<(typeof module.exports)['run']>>}
 * @param {Message | undefined} msg
 * @param {string | undefined} url */
async function sendUpdatedMsg(msg, url) {
  const
    custom = this.options.getString('json'),
    content = this.options.getString('content', false) ?? undefined,
    emoji = this.options.getString('emoji'),
    label = this.options.getString('label'),

    button = new ButtonBuilder(custom
      ? JSON.parse(custom)
      : {
          style: this.options.getNumber('style', true),
          label: label ?? (emoji ? undefined : '\u200E'), emoji, url // U+200E (LEFT-TO-RIGHT MARK) is used as invisible text
        }),
    components = msg?.components ? [...msg.components] : [],
    lastComponent = components.at(-1);

  if (button.data.style != ButtonStyle.Link) button.setCustomId(`buttonCommandButton_${Date.now()}`);
  if (
    !msg?.components.length || this.options.getBoolean('new_row')
    || !(lastComponent instanceof ActionRow) || !lastComponent.components.push(button)
  ) components.push(new ActionRowBuilder({ components: [button] }));

  await (msg?.edit({ content, components }) ?? this.channel.send({ content, components }));

  return button;
}

module.exports = new Command({
  types: [commandTypes.slash],
  cooldowns: { user: msInSecond / 2 },
  ephemeralDefer: true,
  options: [
    {
      name: 'json',
      type: 'Subcommand',
      options: [{
        name: 'json',
        type: 'String',
        required: true
      }]
    },
    {
      name: 'custom',
      type: 'Subcommand',
      options: [
        {
          name: 'style',
          type: 'Number',
          choices: Object.values(ButtonStyle).filter(e => typeof e == 'number' && e != ButtonStyle.Premium),
          required: true
        },
        { name: 'emoji', type: 'String' },
        {
          name: 'label',
          type: 'String',
          maxLength: buttonLabelMaxLength
        },
        {
          name: 'url',
          type: 'String',
          maxLength: buttonURLMaxLength
        },
        { name: 'new_row', type: 'Boolean' },
        { name: 'content', type: 'String' },
        { name: 'message_id', type: 'String' }
      ]
    }
  ],

  async run(lang) {
    const
      style = this.options.getNumber('style'),
      isLink = style ? ButtonStyle[ButtonStyle[style]] == ButtonStyle.Link : false,

      /** @type {Snowflake | null} */
      msgId = this.options.getString('message_id');

    let url = this.options.getString('url');

    if (isLink) {
      if (!url.startsWith('http') && !url.startsWith('discord://')) url = `https://${url}`;
      if (!/^(?:discord|https?):\/\/[\w\-.]+\.[a-z]+/i.test(url)) return this.editReply(lang('invalidURL'));
    }

    let msg, button;
    if (msgId) msg = await getEditableMessage.call(this, msgId, lang);

    try { button = await sendUpdatedMsg.call(this, msg, url); }
    catch (rawErr) {
      const err = rawErr instanceof Error ? rawErr : new Error(rawErr);
      if (err instanceof SyntaxError && !err.message.includes('JSON')) throw err;
      return this.editReply(lang('invalidOption', codeBlock(err.message)));
    }

    delete button.data.custom_id;
    return void this.editReply(
      this.options.getString('json')
        ? lang('successJSON')
        : lang('success', codeBlock('json', JSON.stringify(filterEmptyEntries(button.data))))
    );
  }
});