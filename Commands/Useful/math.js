const
  { EmbedBuilder, Colors } = require('discord.js'),
  mathjs = require('mathjs'),
  { evaluate, isResultSet } = mathjs.create(mathjs.all, { number: 'BigNumber' }),
  superscripts = {
    '²': '^2', '³': '^3',
    '⁴': '^4', '⁵': '^5',
    '⁶': '^6', '⁷': '^7',
    '⁸': '^8', '⁹': '^9'
  },
  parseSpecialChars = /** @param {string}str*/ str => str
    .replaceAll('\n', ';')
    .replaceAll('÷', '/')
    .replaceAll('π', '(pi)')
    .replaceAll(/[\u00B2\u00B3\u2074-\u2079]/g, e => superscripts[e])
    .replaceAll(/√(\(|\d+)/g, (_, e) => e === '(' ? 'sqrt(' : `sqrt(${e})`),
  addSpaces = /** @param {number}fullNum*/ fullNum => {
    if (typeof fullNum != 'number' || !Number.isFinite(fullNum)) return String(fullNum);
    const [num, ext] = String(fullNum).split('.');
    return [...num].reduceRight((acc, e, i) => ((num.length - i) % 3 == 0 ? ` ${e}` : e) + acc, '') + (ext ? `.${ext}` : '');
  };

/** @type {command<'both', false>}*/
module.exports = {
  usage: { examples: '1+1' },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'expression',
    type: 'String',
    required: true
  }],

  run: function (lang) {
    const
      expression = this.options?.getString('expression', true) ?? this.content,
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.White });

    let result;
    try { result = evaluate(parseSpecialChars(expression)); }
    catch (err) {
      embed.data.description = lang('error', err.message);
      embed.data.color = Colors.Red;
      return this.customReply({ embeds: [embed] });
    }

    result = isResultSet(result) ? result.map(e => addSpaces(e)) : addSpaces(result);
    if (isResultSet(result)) result = result.entries.length > 1 ? lang('separated', result.entries.join(' | ')) : result.entries[0];

    return this.customReply({ embeds: [embed.setDescription(lang('success', { expression, result }))] });
  }
};