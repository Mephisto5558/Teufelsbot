const
  { Command } = require('reconlx'),
  { randomBytes } = require('crypto'), //https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
  defaultCharset = Array.from('abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?§$%&/\\=*\'"#*(){}[]');

async function getRandomNumber(oldRandomNumber, length) {
  //Generate a cryptographically strong random number between 0 and one and multiplies it with the length of the charset
  const randomNumber = Math.round(`0.${randomBytes(3).readUIntBE(0, 3)}` * length);

  //Checks if the last random number is the same, if yes, run itself again. If no, returns the random number
  return oldRandomNumber != randomNumber ? randomNumber : getRandomNumber(oldRandomNumber, length);
}

module.exports = new Command({
  name: 'passwordgenerator',
  aliases: { prefix: [], slash: [] },
  description: 'generate a strong passoword',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'length',
      description: 'the length of your password',
      type: 'Number',
      maxValue: 1750,
      required: false
    },
    {
      name: 'count',
      description: 'How many passwords do you want to generate',
      type: 'Number',
      maxValue: 500,
      required: false
    },
    {
      name: 'exclude_chars',
      description: 'characters you wont have in your password',
      type: 'String',
      required: false
    },
    {
      name: 'include_chars',
      description: 'characters you specificity want in your password',
      type: 'String',
      required: false
    }
  ],

  run: async (_, interaction) => {

    const
      length = interaction.options?.getNumber('length') || 12,
      count = interaction.options?.getNumber('count') || 1,
      exclude = interaction.options?.getString('exclude_chars') || '',
      include = interaction.options?.getString('include_chars') || '';

    let passwordList = '```';

    let charset = [...new Set(defaultCharset //new Set() makes sure there are no duplicate entries
      .filter(char => !exclude.includes(char)) //Remove exclude chars from the charset
      .concat(Array.from(include)) //Add include chars to the charset
    )].join('');

    if (!charset.length) return interaction.editReply('you excluded all chars of the charset...'); //Return if charset is empty

    for (let i = 0; i < count; i++) {
      let oldRandomNumber;
      if (passwordList.length > 1750) { //makes sure the pasword list is not to long
        passwordList = passwordList.substring(0, passwordList.lastIndexOf('\n', passwordList.lastIndexOf('\n') - 1));   //removes the last password from the list
        break;
      }

      for (let i = 0; i < length; i++) {
        const randomNumber = await getRandomNumber(oldRandomNumber, charset.length);
        if (charset[oldRandomNumber] + charset[randomNumber] == '\n') { //'\n' should not appear in the list, it would break stuff
          i--;
          continue;
        }
        passwordList += charset[randomNumber]; //Adds one of the chars in the charset to the password, based on the function getRandomNumber
        oldRandomNumber = randomNumber;
      }
      passwordList += '```\n'
    }

    if (charset.length > 100) charset = charset.substring(0, 97) + '...' //Limits the *displayed* charset

    interaction.editReply(
      'Your secure password(s):\n' +
      `${passwordList.trim()}\n\n` +
      '||Created with the following charset:\n' +
      '```' + charset + '```\n' +
      'Use the command options to add or remove chars.||'
    );

  }
})
