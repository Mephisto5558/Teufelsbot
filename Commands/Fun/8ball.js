/**
 * https://github.com/bryc/code/blob/master/jshash/experimental/cyrb53.js
 * @param {string}str
 * @param {number}seed*/
function cyrb53a(str, seed = 0) {
  let
    h1 = 0xDE_AD_BE_EF ^ seed,
    h2 = 0x41_C6_CE_57 ^ seed;

  for (let i = 0, ch; i < str.length; i++) {
    ch = str.codePointAt(i);
    h1 = Math.imul(h1 ^ ch, 0x85_EB_CA_77);
    h2 = Math.imul(h2 ^ ch, 0xC2_B2_AE_3D);
  }

  h1 ^= Math.imul(h1 ^ (h2 >>> 15), 0x73_5A_2D_97);
  h2 ^= Math.imul(h2 ^ (h1 >>> 15), 0xCA_F6_49_A9);
  h1 ^= h2 >>> 16; h2 ^= h1 >>> 16;

  return 2_097_152 * (h2 >>> 0) + (h1 >>> 11);
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
    return this.customReply(responseList[cyrb53a(input.toLowerCase(), Number.parseInt(this.user.id) ^ cyrb53a(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`)) % responseList.length]);
  }
};