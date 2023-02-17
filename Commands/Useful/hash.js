const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getHashes, createHash } = require('crypto');

module.exports = {
  name: 'hash',
  cooldowns: { guild: 100, user: 1000 },
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
      required: true
    }
  ],

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