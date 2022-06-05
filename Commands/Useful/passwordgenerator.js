const { Command } = require('reconlx');
const { randomBytes } = require('crypto'); //https://nodejs.org/api/crypto.html#cryptorandombytessize-callback
const defaultCharset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!"§$%&/=?*\'#*(){}[]';

async function getRandomNumber(oldRandomNumber, length) {
  let randomNumber = Math.floor( //Rounds the number
    `0.${randomBytes(3).readUIntBE(0, 3)}` //Generate a cryptographically strong random number between 0 and one 
    * length //Multiplies the random number with the length of the charset
  )
  if(oldRandomNumber == randomNumber) randomNumber = await getRandomNumber(oldRandomNumber, length) //Checks if the last random number is the same, if yes, run itself again
  return randomNumber;
}

module.exports = new Command({
  name: 'passwordgenerator',
  alias: [],
  description: 'generate a strong passoword',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 1000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'length',
      description: 'the length of your password',
      type: 'NUMBER',
      max_value: 1750,
      required: false
    },
    {
      name: 'count',
      description: 'How many passwords do you want to generate',
      type: 'NUMBER',
      max_value: 500,
      required: false
    },
    {
      name: 'exclude_chars',
      description: 'characters you wont have in your password',
      type: 'STRING',
      required: false
    },
    {
      name: 'include_chars',
      description: 'characters you specificity want in your password',
      type: 'STRING',
      required: false
    }
  ],

  run: async (_, __, interaction) => {

    const length = interaction.options?.getNumber('length') || 12;
    const count = interaction.options?.getNumber('count') || 1;
    const exclude = interaction.options?.getString('exclude_chars') || '';
    const include = interaction.options?.getString('include_chars') || '';

    let passwordList = '```';
    
    let charset = Array.from(defaultCharset) //Converts the charset to an array (list)
      .filter(char => !exclude.includes(char)) //Remove exclude chars from the charset
      .concat(Array.from(include)) //Add include chars to the charset
    
    if(!charset.length) return interaction.editReply('you excluded all chars of the charset...'); //Return if charset is empty

    charset = [...new Set(charset)].join(''); //Removes duplicate entries

    for(a=0; a < count; a++) {
      let oldRandomNumber;
      if(passwordList.length > 1750) { //makes sure the pasword list is not to long
        passwordList = passwordList.substring(0, passwordList.lastIndexOf('\n', passwordList.lastIndexOf('\n') -1 ));   //removes the last password from the list
        break;
      }

      for (let i=0; i < length; i++) {
        const randomNumber = await getRandomNumber(oldRandomNumber, charset.length);
        if(charset[oldRandomNumber] + charset[randomNumber] == '\n') { //'\n' should not appear in the list, it would break stuff
          i--;
          continue;
        }
        passwordList += charset[randomNumber]; //Adds one of the chars in the charset to the password, based on the function getRandomNumber
        oldRandomNumber = randomNumber;
      }
      passwordList += '```\n```'
    }

    if(charset.length > 100) charset = charset.substring(0, 97) + '...' //Limits the *displayed* charset

    interaction.editReply(
      'Your secure password(s):\n' +
      passwordList.replace(/\n```/g, '```\n') + '\n\n' +
      '||Created with the following charset:\n' +
      '```' + charset + '```\n' +
      'Use the command options to add or remove chars.||'
    );

  }
})