const defaultCharset = ['abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?§$%&/\\=*\'"#*(){}[]'];

module.exports = {
  name: 'passwordgenerator',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'length',
      type: 'Number',
      maxValue: 1750
    },
    {
      name: 'count',
      type: 'Number',
      maxValue: 500
    },
    { name: 'exclude_chars', type: 'String' },
    {
      name: 'include_chars',
      description: 'characters you additionally want in your password',
      type: 'String'
    }
  ],

  run: async (interaction, lang) => {

    const
      count = interaction.options?.getNumber('count') || 1,
      exclude = interaction.options?.getString('exclude_chars') || '',
      include = interaction.options?.getString('include_chars') || '';

    let
      passwordList = '```',
      length = interaction.options?.getNumber('length') || 12,
      charset = [...new Set(defaultCharset //new Set() makes sure there are no duplicate entries
        .filter(char => !exclude.includes(char)) //Remove exclude chars from the charset
        .concat(Array.from(include)) //Add include chars to the charset
      )].join('');

    if (!charset.length) return interaction.editReply(lang('charsetEmpty')); //Return if charset is empty

    for (let i = 0; i < count; i++) {
      let oldRandomChar;
      if (passwordList.length > 1750) { //makes sure the pasword list is not to long
        passwordList = passwordList.substring(0, passwordList.lastIndexOf('\n', passwordList.lastIndexOf('\n') - 1));   //removes the last password from the list
        break;
      }

      for (let i = 0; i < length; i++) {
        const randomChar = charset.split('').filter(e => e != oldRandomChar).random(); //Filters the last selected entry out and selects a list entry based on a secure random number generator. Defined in index.js.;
        if (oldRandomChar + randomChar == '\n') { //'\n' should not appear in the list, it would break stuff
          length++
          continue;
        }
        passwordList += randomChar; //Adds one of the chars in the charset to the password, based on the function getRandomNumber
        oldRandomChar = randomChar; //Sets oldRandomChar to the last generated char
      }
      passwordList += '```\n```'
    }

    if (charset.length > 100) charset = charset.substring(0, 97) + '...' //Limits the *displayed* charset

    interaction.editReply(lang('success', { passwords: passwordList.slice(0, -4), charset }));

  }
}