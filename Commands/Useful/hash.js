const
  { EmbedBuilder, Colors } = require('discord.js'),
  { getHashes, createHash } = require('node:crypto');

module.exports = new SlashCommand({
  cooldowns: { user: 1e4 },
  dmPermission: true,
  ephemeralDefer: true,
  options: [
    new CommandOption({
      name: 'input',
      type: 'String',
      required: true
    }),
    new CommandOption({
      name: 'method',
      type: 'String',
      autocompleteOptions: getHashes(),
      strictAutocomplete: true,
      required: true
    })
  ],

  run: async function (lang) {
    const
      input = this.options.getString('input', true),
      method = this.options.getString('method', true),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription', { input: input.length > 500 ? `${input.slice(0, 500)}\n...` : input, method }),
        color: Colors.DarkGold
      });

    return this.editReply({ content: lang('text', createHash(method).update(input).digest('hex')), embeds: [embed] });
  }
});