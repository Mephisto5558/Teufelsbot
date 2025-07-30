const
  { Colors, EmbedBuilder, codeBlock } = require('discord.js'),
  mathjs = require('mathjs'),
  math = mathjs.create(mathjs.all, { number: 'BigNumber' }),

  /** @type {Record<string, string>} hurts to annotate it this way but not really having a choice due to `@typescript-eslint/no-unsafe-return` */
  superscripts = {
    '²': '^2', '³': '^3',
    '⁴': '^4', '⁵': '^5',
    '⁶': '^6', '⁷': '^7',
    '⁸': '^8', '⁹': '^9'
  },
  parseSpecialChars = /** @param {string} str */ str => str
    .replaceAll('\n', ';')
    .replaceAll('÷', '/')
    .replaceAll('π', '(pi)')
    .replaceAll(/[\u00B2\u00B3\u2074-\u2079]/g, e => superscripts[e])
    .replaceAll(/√(?<val>\(|\d+)/g, (_, val) => val === '(' ? 'sqrt(' : `sqrt(${val})`);

/** @type {command<'both', false>} */
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
      expression = parseSpecialChars(this.options?.getString('expression', true) ?? this.content),
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.White });

    /** @type {number | mathjs.Unit | undefined} */
    let result;
    try { result = math.evaluate(expression); }
    catch (err) { return this.customReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('error', codeBlock(err.message)))] }); }

    return this.customReply({ embeds: [
      embed.setDescription(lang('success', {
        expression: codeBlock(expression),
        result: codeBlock(typeof result == 'number' ? lang.formatNumber(result) : result)
      }))
    ] });
  }
};