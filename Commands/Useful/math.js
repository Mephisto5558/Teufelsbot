const
  { EmbedBuilder, Colors } = require('discord.js'),
  { evaluate, isResultSet } = require('mathjs');

module.exports = {
  name: 'math',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'expression',
    type: 'String',
    required: true
  }],

  run: function (lang) {
    const expression = (this.content || this.options?.getString('expression'))?.replaceAll('\n', ';').replaceAll('÷', '/');
    if (!expression) return this.customReply(lang('noInput'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      color: Colors.White
    });

    let result;

    try { result = evaluate(expression); }
    catch (err) {
      embed.data.description = lang('error', err.message);
      embed.data.color = Colors.Red;
      return this.customReply({ embeds: [embed] });
    }

    if (isResultSet(result)) result = result.entries.length ? lang('separated', result.entries.join(' | ')) : result.entries;

    embed.data.description = lang('success', { expression, result });
    this.customReply({ embeds: [embed] });
  }
};