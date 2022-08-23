const
  { Command } = require('reconlx'),
  { EmbedBuilder, Colors } = require('discord.js'),
  { evaluate, isResultSet } = require('mathjs'),
  embed = new EmbedBuilder({
    title: 'Calculator'
  });

module.exports = new Command({
  name: 'math',
  aliases: { prefix: [], slash: [] },
  description: 'run some basic math',
  usage: 'math [expression | "help"]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true, beta: true,
  options: [{
    name: 'expression',
    description: 'what do you want me to solve? Write "help" for help',
    type: 'String',
    required: true
  }],

  run: (message, lang, { functions }) => {
    const expression = (message.args?.[0] || message.options?.getString('expression'))?.replace(/\n/g, ';').replace(/÷/g, '/');
    if (!expression) return functions.reply(lang('noInput'), message);

    if (expression == 'help') {
      embed.data.description = lang('help');
      return functions.reply({ embeds: [embed] }, message);
    }

    let data;

    try { data = evaluate(expression) }
    catch (err) {
      embed.data.description = lang('error', err.message);
      embed.data.color = Colors.Red;
      return functions.reply({ embeds: [embed] }, message);
    }

    embed.data.color = Colors.White

    if (isResultSet(data)) {
      if (data.entries.length > 1) data = lang('separated', data.entries.join(' | '));
      else data = data.entries
    }

    embed.data.description = lang('success', expression, data);
    functions.reply({ embeds: [embed] }, message);
  }
})