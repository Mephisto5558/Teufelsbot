const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getHashes, createHash } = require('node:crypto'),
  MAX_DESCRIPTION_LENGTH = 500;

/** @type {command<'slash', false>}*/
module.exports = {
  cooldowns: { user: 1e4 },
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
        description: lang('embedDescription', { input: input.length > MAX_DESCRIPTION_LENGTH ? `${input.slice(0, MAX_DESCRIPTION_LENGTH)}\n...` : input, method }),
        color: Colors.DarkGold
      });

    return this.editReply({ content: lang('text', createHash(method).update(input).digest('hex')), embeds: [embed] });
  }
};