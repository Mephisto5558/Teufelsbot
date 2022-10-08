const
  { EmbedBuilder, Colors } = require('discord.js'),
  { evaluate, isResultSet } = require('mathjs');

module.exports = {
  name: 'math',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'expression',
    type: 'String',
    required: true
  }],

  run: function (lang) {
    const expression = (this.content || this.options?.getString('expression'))?.replaceAll('\n', ';').replaceAll('÷', '/');
    if (!expression) return this.customReply(lang('noInput'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle')
    });

    if (expression == 'help') {
      embed.data.description = lang('help');
      return this.customReply({ embeds: [embed] });
    }

    let data;

    try { data = evaluate(expression); }
    catch (err) {
      embed.data.description = lang('error', err.message);
      embed.data.color = Colors.Red;
      return this.customReply({ embeds: [embed] });
    }

    embed.data.color = Colors.White;

    if (isResultSet(data)) {
      if (data.entries.length > 1) data = lang('separated', data.entries.join(' | '));
      else data = data.entries;
    }

    embed.data.description = lang('success', { expression, result: data });
    this.customReply({ embeds: [embed] });
  }
};