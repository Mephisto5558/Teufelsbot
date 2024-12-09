const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getHashes, createHash } = require('node:crypto'),
  { constants: { embedDescriptionMaxLength }, timeFormatter: { msInSecond } } = require('#Utils');

/** @type {command<'slash', false>} */
module.exports = {
  cooldowns: { user: msInSecond },
  slashCommand: true,
  prefixCommand: false,
  dmPermission: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'input',
      type: 'String',
      required: true
    },
    {
      name: 'method',
      type: 'String',
      autocompleteOptions: getHashes(),
      strictAutocomplete: true,
      required: true
    }
  ],

  async run(lang) {
    const
      input = this.options.getString('input', true),
      method = this.options.getString('method', true),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription', { input: input.length > embedDescriptionMaxLength ? `${input.slice(0, embedDescriptionMaxLength)}\n...` : input, method }),
        color: Colors.DarkGold
      });

    return this.editReply({ content: lang('text', createHash(method).update(input).digest('hex')), embeds: [embed] });
  }
};