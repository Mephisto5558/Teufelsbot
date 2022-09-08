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

  run: (message, lang) => {
    const expression = (message.args?.[0] || message.options?.getString('expression'))?.replaceAll('\n', ';').replaceAll('÷', '/');
    if (!expression) return message.customReply(lang('noInput'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle')
    });

    if (expression == 'help') {
      embed.data.description = lang('help');
      return message.customReply({ embeds: [embed] });
    }

    let data;

    try { data = evaluate(expression) }
    catch (err) {
      embed.data.description = lang('error', err.message);
      embed.data.color = Colors.Red;
      return message.customReply({ embeds: [embed] });
    }

    embed.data.color = Colors.White

    if (isResultSet(data)) {
      if (data.entries.length > 1) data = lang('separated', data.entries.join(' | '));
      else data = data.entries
    }

    embed.data.description = lang('success', { expression, result: data });
    message.customReply({ embeds: [embed] });
  }
}