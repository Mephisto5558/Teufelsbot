const
  { MessageEmbed } = require('discord.js'),
  { Command } = require('reconlx'),
  crypto = require('crypto-js');

  encryptOptionList = [
    //type,          encryptFunction, decryptFunction
    [ 'AES',        'AES.encrypt',    'AES.decrypt' ],
    [ 'DES',        'DES.encrypt',    'DES.decrypt' ],
    [ 'MD5',        'MD5'                           ],
    [ 'RIPEMD160',  'RIPEMD160'                     ],
    [ 'SHA1',       'SHA1'                          ],
    [ 'SHA224',     'SHA224'                        ],
    [ 'SHA256',     'SHA256'                        ],
    [ 'SHA3',       'SHA3'                          ],
    [ 'SHA384',     'SHA384'                        ],
    [ 'SHA512',     'SHA512'                        ]
  ];

  let cryptoOptions = [ [], [] ];

  encryptOptionList.forEach(option => {
    if(option[1])
      cryptoOptions[0].push({ name: option[0], value: option[1] });
    if(option[2])
      cryptoOptions[1].push({ name: option[0], value: option[2] });
  })

module.exports = new Command({
  name: 'hash',
  alias: [],
  description: 'encrypt or decrypt your text with various methods',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'FUN',
  slashCommand: true,
  prefixCommand: false,
  disabled: false,
  noDefer: true,
  options: [
    {
      name: 'input',
      description: 'the text you want to encrypt or decrypt',
      type: 'STRING',
      required: true,
    },
    {
      name: 'direction',
      description: 'do you want to decrypt or encrypt?',
      type: 'STRING',
      required: true,
      choices: [
        { name: 'encrypt', value: 'encrypt' },
        { name: 'decrypt', value: 'decrypt' }
      ],
    },
    {
      name: 'encrypt_method',
      description: 'with which method your text should get encrypted',
      type: 'STRING',
      required: false,
      choices: cryptoOptions[0]
    },
    {
      name: 'decrypt_method',
      description: 'with wich method your text should get decrypted',
      type: 'STRING',
      required: false,
      choices: cryptoOptions[1]
    },
    {
      name: 'key',
      description: 'used for salt/key in encryption',
      type: 'STRING',
      required: false
    }
  ],

  run: async(_, __, interaction) => {

    await interaction.reply({
      content: 'checking your input....',
      ephemeral: true
    })

    let
      input = interaction.options.getString('input'),
      direction = interaction.options.getString('direction'),
      method = interaction.options.getString(`${direction}_method`),
      key = interaction.options.getString('key'),
      functionArgsTest = [],
      errorMsg,
      output;

      if(!method && direction == 'encrypt') {
        method = 'SHA512',
        interaction.editReply({
          content: `setting the encryption method to default (${method})`,
          ephemeral: true
        });
      }
      else if (!method) {
        return interaction.editReply({
          content: 'You MUST provide the decryption_method argument!', ephemeral: true
        }); 
      };
      method = method.split('.');

      functionArgsTest[0] = function test() { try {
        if(method[1]) return !!crypto[method[0]][method[1]]();
        else return !!crypto[method]();
      } catch { return false }}(null);

      functionArgsTest[1] = function test() { try {
        if(method[1]) return !crypto[method[0]][method[1]].toString().split(/function\s.*?\([^)]*\)/)[0].match(/key|salt/);
        else return !crypto[method].toString().split(/function\s.*?\([^)]*\)/)[0].match(/key|salt/);
      } catch { return false }}(null);
      
      let functionValid = function test() { try {
        functionArgsTest.forEach(test => {
          if(!test) throw 'err';
        })
      } catch { return 'err' }}(null)
      if(functionValid == 'err') {

        if(!functionArgsTest[0] && !functionArgsTest[1]) {
          errorMsg =
            `The ${method[0]} method does not exist.\n` +
            'Please message the dev.';
        }
        else if(functionArgsTest[1]) {
          errorMsg = 
            `in order to use the \`${method[0]} ${direction}ion\` method, you need to provide the \`key\` argument.\n` +
            'The `key` will be used as salt or as key, depending on the encryption method.';
        }
        else { 
          console.error('An unhandled functionArgsTest error occurred. Values:')
          console.error(functionArgsTest);

          errorMsg =
            'An unknown error occurred.\n' +
            'Please message the dev.';
        }
        if(!key && !functionArgsTest[0]) {
          return interaction.editReply({
            content: errorMsg, ephemeral: true
          });
        }
      }

      interaction.editReply({
        content: 'working on it...', ephemeral: true
      })
      
      if(method[1]) output = await crypto[method[0]][method[1]](input, key);
      else output = await crypto[method](input, key);

      if(direction == 'decrypt') {
        let output2 = require('../../Functions/private/convert.js')
          .hex.toText(
            {
              string: output.toString(), type: 'hex',
              options: { convertTo: 'text', withSpaces: false, convertSpaces: true }
            }
          )
        output = output2;
      }

      if(key) key = `\`${key}\``;

      let embed = new MessageEmbed()
        .setTitle('Hash Function')
        .setDescription(
          `Your input: \`${input}\`\n` +
          `Your key/salt: ${key || 'none'}\n` +
          `Encryption mode: \`${direction}:${method[0]}\``
        );

      interaction.editReply({
        content:
          `Your hashed/ unhashed string:\n` +
          `\`${output}\``,
        embeds: [embed],
        ephemeral: true
      })

  }
})