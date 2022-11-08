const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getHashes, createHash } = require('crypto');

module.exports = {
  name: 'hash',
  cooldowns: { guild: 100, user: 1000 },
  category: 'Useful',
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
      autocomplete: true,
      autocompleteOptions: getHashes(),
      required: true
    }
  ],

  run: function (lang) {
    const
      input = this.options.getString('input'),
      method = this.options.getString('method'),
      hash = createHash(method).update(input).digest('hex');

    let embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { input: input.length > 500 ? `${input.substring(0, 500)}\n...` : input, method }),
      color: Colors.DarkGold
    });

    this.editReply({
      content: lang('text', hash),
      embeds: [embed]
    });
  }
};