const
  { inlineCode } = require('discord.js'),
  { randomInt } = require('node:crypto'),
  defaultMaxNum = 100;

/** @type {command<'both', false>} */
module.exports = {
  usage: { examples: '1 10' },
  aliases: { prefix: ['random-number'] },
  slashCommand: true,
  prefixCommand: true,
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
      const randomNumber = randomInt(min, max + 1).toLocaleString(lang.__boundArgs__[0].locale);
      return this.customReply(lang('randomNumber', {
        randomNumber, min: min.toLocaleString(lang.__boundArgs__[0].locale), max: max.toLocaleString(lang.__boundArgs__[0].locale)
      }));
    }
    catch (err) {
      if (!(err instanceof RangeError || err.code == 'ERR_INVALID_ARG_TYPE')) throw err;

      return this.customReply(lang('outOfRange', {
        min: inlineCode(Number.MIN_SAFE_INTEGER.toLocaleString(lang.__boundArgs__[0].locale)),
        max: inlineCode(Number.MAX_SAFE_INTEGER.toLocaleString(lang.__boundArgs__[0].locale))
      }));
    }
  }
};