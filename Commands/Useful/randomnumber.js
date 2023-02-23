const { randomInt } = require('crypto');

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
      min = this.options?.getInteger('minimum') || parseInt(Number(this.args?.[0])),
      max = this.options?.getInteger('maximum') || parseInt(Number(this.args?.[1]));

    if (isNaN(min)) min = 0;
    if (isNaN(max)) max = 100;

    try { this.customReply((min > max ? randomInt(max, min) : randomInt(min, max)).toString()); }
    catch (err) {
      if (err instanceof RangeError) return this.customReply(lang('outOfRange', err.message));
      throw err;
    }
  }
};