const { Command } = require("reconlx");
const { MessageEmbed } = require("discord.js");
const axios = require('axios');

module.exports = new Command({
  name: 'joke',
  aliases: [],
  description: `sends a joke`,
  permissions: { client: [], user: [] },
  cooldowns: { global: 100, user: '' },
  slashCommand: true,
  prefixCommand: true,
  category: "Fun",
  args: {
    type: '*',
    blacklist: ['nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit']
  },
  options: [{
      name: 'type',
      description: `The type/tag of the joke (not all apis support types/tags)`,
      type: 'STRING',
      required: false,
    },
    {
      name: 'blacklist',
      description: `blacklist specific joke tags. No warranty this works every time. run /help joke to see posible blacklist options`,
      type: 'STRING',
      required: false,
    }
  ],

  run: async(client, message, interaction) => {

    let APIs = [
      { name: 'jokeAPI', url: 'https://v2.jokeapi.dev' },
      { name: 'humorAPI', url: 'https://humorapi.com' },
      { name: 'icanhazdadjoke', url: 'https://icanhazdadjoke.com' }
    ];
    let response;
    let type;
    let blacklist;
    let options;
    let API;
    if (interaction) {
      type = interaction.options.getString('type');
      blacklist = interaction.options.getString('blacklist');
    }

    async function getJoke(APIs) {
      API = APIs[Math.floor(Math.random() * APIs.length)];

      try {
        switch (API.name) {
          case 'jokeAPI':
            options = {
              method: 'GET',
              timeout: 2500,
              url: 'https://v2.jokeapi.dev/joke/Any',
              params: { lang: 'en' }
            }
            if (blacklist) options.params.blacklistFlags = blacklist

            await axios.request(options).then(r => {
              if (r.data.type === 'twopart') {
                response = r.data.setup +
                  `\n\n||` + r.data.delivery + '||'
              } else { response = r.data.joke }
            })
            break;

          case 'humorAPI':
            options = {
              method: 'GET',
              timeout: 2500,
              url: 'https://api.humorapi.com/jokes/random',
              params: {
                'api-key': client.keys.jokes.humorAPIKey,
                'min-rating': '7',
                'max-length': '2000'
              }
            };
            if (type) options.params['include-tags'] = type;
            if (blacklist) options.params['exclude-tags'] = blacklist;

            await axios.request(options).then(r => {
              if (r.data.joke.search('Q: ') == -1) { response = r.data.joke } else {
                response = r.data.joke
                  .replace('Q: ', '')
                  .replace('A: ', '\n||') + '||\n'
              }
            })
            break;

          case 'icanhazdadjoke':
            options = {
              method: 'GET',
              timeout: 2500,
              url: 'https://icanhazdadjoke.com',
              headers: {
                'User-Agent': 'My discord bot (https://github.com/Mephisto5558/Teufelswerk-Bot)',
                Accept: 'application/json'
              }
            };

            await axios.request(options).then(r => {
              response = r.data.joke
            });
            break;
        }
      } catch (err) {
        const errorCodes = [402, 403, 522];
        if (errorCodes.indexOf(err.status) > -1) {
          console.error('joke.js: ')
          console.error(err.response)
        } else {
          if (err.statusText) {
            console.error(`joke.js: ${API.url} responded with error ` +
              err.status + ', ' + err.statusText + ': ' + err.response?.data.message
            )
          } else if (err.response) {
            console.error(`joke.js: ${API.url} responded with error ` +
              err.response.status + ', ' + err.response.statusText + ': ' + err.response.data.message
            )
          } else {
            console.error('joke.js:');
            console.error(err)
          }
        }
        console.error('Trying next API');
        APIs = APIs.filter(str => str.name !== API.name)
        if (APIs) await getJoke(APIs);
      }
    }

    await getJoke(APIs);

    if (!response) {
      if (message) return client.functions.reply('Apparently, there is currently no API available. Please try again later.', message);
      else return interaction.followUp('Apparently, there is currently no API available. Please try again later.');
    };

    response.replace('`', "'");

    let embed = new MessageEmbed()
      .setTitle('Is this funny?')
      .setDescription(response + `\n- [${API.name}](${API.url})`);

    if (message) client.functions.reply({ embeds: [embed] }, message);
    else interaction.followUp({ embeds: [embed] })
  }
})