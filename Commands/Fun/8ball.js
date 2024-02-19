/**
 * @param {string}str
 * @param {number}seed*/
function cyrb53(str, seed = 0) { // https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
  let
    h1 = 0xDE_AD_BE_EF ^ seed,
    h2 = 0x41_C6_CE_57 ^ seed;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.codePointAt(i);
    h1 = Math.imul(h1 ^ ch, 2_654_435_761);
    h2 = Math.imul(h2 ^ ch, 1_597_334_677);
  }

  h1 = Math.imul(h1 ^ (h1 >>> 16), 2_246_822_507);
  h1 ^= Math.imul(h2 ^ (h2 >>> 13), 3_266_489_909);
  h2 = Math.imul(h2 ^ (h2 >>> 16), 2_246_822_507);
  h2 ^= Math.imul(h1 ^ (h1 >>> 13), 3_266_489_909);

  return 4_294_967_296 * (2_097_151 & h2) + (h1 >>> 0);
}

/** @type {command<'both', false>}*/
module.exports = {
  name: '8ball',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'question',
    type: 'String',
    required: true
  }],

  run: function (lang) {
    const input = this.options?.getString('question') ?? this.content;
    if (!input) return this.customReply(lang('noQuestion'));

    const now = new Date();
    const responseList = lang.__boundThis__.localeData[lang.__boundArgs__[0].locale][`${lang.__boundArgs__[0].backupPath}.responseList`];
    return this.customReply(responseList[cyrb53(input.toLowerCase(), Number.parseInt(this.user.id) ^ cyrb53(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`)) % responseList.length]);
  }
};