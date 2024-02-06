const defaultCharset = ['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?§$%&/\\=*\'"#*(){}[]'];

/** @type {command<'slash', false>}*/
module.exports = {
  name: 'passwordgenerator',
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

  run: function (lang) {
    const
      count = this.options?.getInteger('count') || 1,
      exclude = this.options?.getString('exclude_chars') || '',
      include = this.options?.getString('include_chars') || '',
      length = this.options?.getInteger('length') || 12;

    let
      passwordList = '',
      charset = [...new Set(defaultCharset //new Set() makes sure there are no duplicate entries
        .filter(char => !exclude.includes(char)) //Remove exclude chars from the charset
        .concat(Array.from(include)) //Add include chars to the charset
      )].join('');

    if (!charset.length) return this.editReply(lang('charsetEmpty')); //Return if charset is empty

    for (let i = 0; i < count; i++) {
      let lastRandomChar;
      if (passwordList.length + length > 1740) break;

      passwordList += '```';

      for (let i = 0; i < length; i++) {
        const randomChar = charset.split('').filter(e => e != lastRandomChar).random(); //Filters the last selected entry out and selects a list entry based on a secure random number generator. Defined in Utils/prototypeRegisterer.js.
        if (lastRandomChar + randomChar == '\n') passwordList += '\\n'; //Escape \n so it doesn't break formatting
        else passwordList += randomChar; //Adds one of the chars in the charset to the password
        lastRandomChar = randomChar; //Sets lastRandomChar to the last generated char
      }
      passwordList += '```\n';
    }

    if (charset.length > 100) charset = charset.substring(0, 97) + '...'; //Limits the *displayed* charset length

    return this.editReply(lang('success', { passwords: passwordList, charset }));
  }
};