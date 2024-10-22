const
  { EmbedBuilder, Colors } = require('discord.js'),
  mathjs = require('mathjs'),
  math = mathjs.create(mathjs.all, { number: 'BigNumber' }),
  SPLIT_POS = 3, // "1 234 567"
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
    .replaceAll(/√(?<val>\(|\d+)/g, (_, val) => val === '(' ? 'sqrt(' : `sqrt(${val})`),
  addSpaces = /** @param {number}fullNum*/ fullNum => {
    if (typeof fullNum != 'number' || !Number.isFinite(fullNum)) return String(fullNum);
    const [num, ext] = String(fullNum).split('.');
    return [...num].reduceRight((acc, e, i) => ((num.length - i) % SPLIT_POS == 0 ? ` ${e}` : e) + acc, '') + (ext ? `.${ext}` : '');
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

  async run(lang) {
    const
      expression = this.options?.getString('expression', true) ?? this.content,
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.White });

    /** @type {number | number[]} */
    let result;
    try { result = math.evaluate(parseSpecialChars(expression)); }
    catch (err) {
      embed.data.description = lang('error', err.message);
      embed.data.color = Colors.Red;
      return this.customReply({ embeds: [embed] });
    }

    if (math.isResultSet(result)) {
      result = result.map(e => addSpaces(e));
      result = result.entries.length ? lang('separated', result.entries.join(' | ')) : result.entries[0];
    }
    else result = addSpaces(result);

    return this.customReply({ embeds: [embed.setDescription(lang('success', { expression, result }))] });
  }
};