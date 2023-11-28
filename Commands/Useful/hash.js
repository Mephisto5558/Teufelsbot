const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getHashes, createHash } = require('crypto');

/**@type {command}*/
module.exports = {
  name: 'hash',
  cooldowns: { user: 10000 },
  slashCommand: true,
  prefixCommand: false,
  dmPermission: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'input',
      type: 'String',
      required: true,
    },
    {
      name: 'method',
      type: 'String',
      autocompleteOptions: getHashes(),
      strictAutocomplete: true,
      required: true
    }
  ],

  /**@this Interaction*/
  run: function (lang) {
    const
      input = this.options.getString('input'),
      method = this.options.getString('method'),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription', { input: input.length > 500 ? `${input.substring(0, 500)}\n...` : input, method }),
        color: Colors.DarkGold
      });

    return this.editReply({ content: lang('text', createHash(method).update(input).digest('hex')), embeds: [embed] });
  }
};