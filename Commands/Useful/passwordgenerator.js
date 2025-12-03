const
  { codeBlock } = require('discord.js'),
  { msInSecond } = require('#Utils').timeFormatter,

  /* eslint-disable-next-line @typescript-eslint/no-misused-spread -- all simple ascii chars */
  DEFAULT_CHARSET = [...String.raw`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?§$%&/\=*'"#*(){}[]`],
  DEFAULT_PASSWORD_LENGTH = 12,
  MAX_PASSWORD_LENGTH = 1750,
  MAX_PASSWORDS = 500,
  MAX_MESSAGE_LENGTH = 1740,
  MAX_DISPLAYED_CHARSET_LEN = 100,
  suffix = '...';

/**
 * Helper function to prevent `eslint/no-loop-func`.
 *
 * Filters the last selected entry out and selects a random list entry.
 * RNG defined in Utils/prototypeRegisterer.js.
 * @param {string[]} charset
 * @param {string?} lastRandomChar */
const getRandomChar = (charset, lastRandomChar) => charset.filter(e => e !== lastRandomChar).random();

/** @type {command<'slash', false>} */
module.exports = {
  cooldowns: { user: msInSecond },
  slashCommand: true,
  prefixCommand: false,
  dmPermission: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'length',
      type: 'Integer',
      maxValue: MAX_PASSWORD_LENGTH
    },
    {
      name: 'count',
      type: 'Integer',
      maxValue: MAX_PASSWORDS
    },
    { name: 'exclude_chars', type: 'String' },
    { name: 'include_chars', type: 'String' }
  ],

  async run(lang) {
    const
      count = this.options.getInteger('count') ?? 1,
      exclude = this.options.getString('exclude_chars') ?? '',
      include = this.options.getString('include_chars') ?? '',
      length = this.options.getInteger('length') ?? DEFAULT_PASSWORD_LENGTH,
      /** @type {ReturnType<typeof codeBlock<string>>[]} */ passwordList = [],

      segmenter = new Intl.Segmenter(lang.config.locale, { granularity: 'grapheme' });

    // Remove exclude chars and add include chars to the charset.

    let charset = [...DEFAULT_CHARSET.filter(char => !exclude.includes(char)), ...[...segmenter.segment(include)].map(e => e.segment)]
      .unique(); // Remove duplicates.

    if (!charset.length) return this.editReply(lang('charsetEmpty')); // return if charset is empty

    // Loop over the amount of passwords to be generated, break early if the length of all passwords combined is greater than `MAX_MESSAGE_LENGTH`.
    for (let i = 0; i < count && passwordList.join('\n').length < MAX_MESSAGE_LENGTH; i++) {
      let password = '';
      for (let lastRandomChar, i = 0; i < length; i++) {
        // Get the random char and escape it so it doesn't break formatting.
        const randomChar = String.raw({ raw: getRandomChar(charset, lastRandomChar) });

        // Adds one of the chars in the charset to the password.
        password += randomChar;
        lastRandomChar = randomChar; // Sets lastRandomChar to the last generated char.
      }

      // Add the password to the password list after wrapping it in a code block.
      passwordList.push(codeBlock(password).replaceAll('\n', ''));
    }

    // Limits the *displayed* charset length.
    if (charset.length > MAX_DISPLAYED_CHARSET_LEN) charset = charset.slice(0, MAX_DISPLAYED_CHARSET_LEN - suffix.length).join('') + suffix;

    return this.editReply(lang('success', { passwords: passwordList.join('\n'), charset: codeBlock(charset.join('')) }));
  }
};