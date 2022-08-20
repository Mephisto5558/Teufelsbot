const
  { Command } = require('reconlx'),
  { Message, EmbedBuilder, Colors } = require('discord.js'),
  { evaluate, isResultSet } = require('mathjs'),
  embed = new EmbedBuilder({
    title: 'Calculator',
    color: Colors.White
  });

module.exports = new Command({
  name: 'math',
  aliases: { prefix: [], slash: [] },
  description: 'run some basic math',
  usage: 'math [expression]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: true, beta: true,
  options: [{
    name: 'expression',
    description: 'what do you want me to solve?',
    type: 'String',
    required: true
  }],

  run: (message, lang, { functions }) => {
    const expression = (message.args?.[0] || message.options?.getString('expression'))?.replace('\n', ';');
    if (!expression) message instanceof Message ? functions.reply(lang('noInput'), message) : message.editReply(lang('noInput'));

    let data;

    try { data = evaluate(expression) }
    catch (err) {
      embed.data.description = lang('error', err.message);
      embed.data.color = Colors.Red;
      return message instanceof Message ? functions.reply({ embeds: [embed] }, message) : message.editReply({ embeds: [embed] });
    }

    if (isResultSet(data)) data = lang('separated', data.entries.join(' | '));

    embed.data.description = lang('success', expression, data);

    message instanceof Message ? functions.reply({ embeds: [embed] }, message) : message.editReply({ embeds: [embed] });
  }
})