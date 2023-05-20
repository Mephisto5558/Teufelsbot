const
  { EmbedBuilder, Colors } = require('discord.js'),
  { evaluate, isResultSet } = require('mathjs'),
  superscripts = {
    '²': '^2', '³': '^3',
    '⁴': '^4', '⁵': '^5',
    '⁶': '^6', '⁷': '^7',
    '⁸': '^8', '⁹': '^9',
  },
  parseSpecialChars = str => str
    .replaceAll('\n', ';')
    .replaceAll('÷', '/')
    .replaceAll('π', '(pi)')
    .replace(/[\u00B2-\u00B3\u2074-\u2079]/g, e => superscripts[e])
    .replace(/(?:√)(\(|\d+)/g, (_, e) => e === '(' ? 'sqrt(' : `sqrt(${e})`);

// eslint-disable-next-line no-unused-vars
function test() { //test code
  const expressions = [''];

  for (const expression of expressions) {
    const modifiedExpression = parseSpecialChars(expression);

    try {
      const result = evaluate(modifiedExpression);
      console.log([expression, modifiedExpression, result]);
    }
    catch (err) { console.log([expression, modifiedExpression, err.message]); }
  }
}

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
    const expression = this.content || this.options?.getString('expression');
    if (!expression) return this.customReply(lang('noInput'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      color: Colors.White
    });

    let result;

    try { result = evaluate(parseSpecialChars(expression)); }
    catch (err) {
      embed.data.description = lang('error', err.message);
      embed.data.color = Colors.Red;
      return this.customReply({ embeds: [embed] });
    }

    if (isResultSet(result)) result = result.entries.length > 1 ? lang('separated', result.entries.join(' | ')) : result.entries[0];

    return this.customReply({ embeds: [embed.setDescription(lang('success', { expression, result }))] });
  }
};