const defaultCharset = [String.raw`abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?§$%&/\=*'"#*(){}[]`];

/**
 * Helper function to prevent `eslint/no-loop-func`
 *
 * Filters the last selected entry out and selects a list entry based on a secure random number generator (RNG). RNG defined in Utils/prototypeRegisterer.js.
 * @param {string[]}charset
 * @param {string?}lastRandomChar*/
const getRandomChar = (charset, lastRandomChar) => charset.filter(e => e !== lastRandomChar).random();

/** @type {command<'slash', false>}*/
module.exports = {
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: false,
  dmPermission: true,
  ephemeralDefer: true,
  options: [
    {
      name: 'length',
      type: 'Integer',
      maxValue: 1750
    },
    {
      name: 'count',
      type: 'Integer',
      maxValue: 500
    },
    { name: 'exclude_chars', type: 'String' },
    { name: 'include_chars', type: 'String' }
  ],

  run: async function (lang) {
    const
      count = this.options.getInteger('count') ?? 1,
      exclude = this.options.getString('exclude_chars') ?? '',
      include = this.options.getString('include_chars') ?? '',
      length = this.options.getInteger('length') ?? 12;

    let
      passwordList = '',
      charset = [...new Set( // new Set() makes sure there are no duplicate entries
        [...defaultCharset.filter(char => !exclude.includes(char)), ...include] // Remove exclude chars and add include chars to the charset
      )].join('');

    if (!charset.length) return this.editReply(lang('charsetEmpty')); // Return if charset is empty

    for (let i = 0; i < count; i++) {
      let lastRandomChar;
      if (passwordList.length + length > 1740) break;

      passwordList += '```';

      for (let i = 0; i < length; i++) {
        // Get the random char and escape it so they it doesn't break formatting
        const randomChar = String.raw({ raw: getRandomChar([...charset], lastRandomChar) });

        // Adds one of the chars in the charset to the password
        passwordList += lastRandomChar + randomChar;
        lastRandomChar = randomChar; // Sets lastRandomChar to the last generated char
      }
      passwordList += '```\n';
    }

    if (charset.length > 100) charset = charset.slice(0, 97) + '...'; // Limits the *displayed* charset length

    return this.editReply(lang('success', { passwords: passwordList, charset }));
  }
};