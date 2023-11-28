const { randomInt } = require('crypto');

/**@type {command}*/
module.exports = {
  name: 'randomnumber',
  aliases: { prefix: ['random-number'] },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  ephemeralDefer: true,
  options: [
    { name: 'minimum', type: 'Integer' },
    { name: 'maximum', type: 'Integer' }
  ],

  run: function (lang) {
    let
      min = this.options?.getInteger('minimum') || Number(this.args?.[0]),
      max = this.options?.getInteger('maximum') || Number(this.args?.[1]);

    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = 100;

    if (min > max) [min, max] = [max, min];

    try {
      const randomnumber = randomInt(min, max + 1).toLocaleString(lang.__boundArgs__[0].locale);
      return this.customReply(lang('randomnumber', { randomnumber, min, max }));
    }
    catch (err) {
      if (err instanceof RangeError || err.code == 'ERR_INVALID_ARG_TYPE')
        return this.customReply(lang('outOfRange', {
          min: Number.MIN_SAFE_INTEGER.toLocaleString(lang.__boundArgs__[0].locale),
          max: Number.MAX_SAFE_INTEGER.toLocaleString(lang.__boundArgs__[0].locale)
        }));

      throw err;
    }
  }
};