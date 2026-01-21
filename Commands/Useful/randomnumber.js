const
  { inlineCode } = require('discord.js'),
  { randomInt } = require('node:crypto'),
  { Command, commandTypes } = require('@mephisto5558/command'),

  defaultMaxNum = 100;

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  usage: { examples: '1 10' },
  aliases: { [commandTypes.prefix]: ['random-number'] },
  dmPermission: true,
  ephemeralDefer: true,
  options: [
    { name: 'minimum', type: 'Integer' },
    { name: 'maximum', type: 'Integer' }
  ],

  async run(lang) {
    let
      min = this.options?.getInteger('minimum') ?? Number(this.args?.[0]),
      max = this.options?.getInteger('maximum') ?? Number(this.args?.[1] ?? 0);

    if (min > max) [min, max] = [max, min];

    if (Number.isNaN(min)) min = 0;
    if (Number.isNaN(max) || min == max && min == 0) max = defaultMaxNum;

    try {
      return void this.customReply(lang('randomNumber', {
        randomNumber: lang.formatNumber(randomInt(min, max + 1)),
        min: lang.formatNumber(min), max: lang.formatNumber(max)
      }));
    }
    catch (err) {
      if (!(err instanceof RangeError || err.code == 'ERR_INVALID_ARG_TYPE')) throw err;

      return this.customReply(lang('outOfRange', {
        min: inlineCode(lang.formatNumber(Number.MIN_SAFE_INTEGER)),
        max: inlineCode(lang.formatNumber(Number.MAX_SAFE_INTEGER))
      }));
    }
  }
});