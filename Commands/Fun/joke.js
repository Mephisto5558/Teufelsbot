const
  { Command } = require('reconlx'),
  { EmbedBuilder } = require('discord.js'),
  { get } = require('axios').default,
  package = require('../../package.json')?.repository?.url
    .replace(/.*\.com\/|\.git/g, '').split('/'),
  APIList = [
    { name: 'jokeAPI', url: 'https://v2.jokeapi.dev' },
    { name: 'humorAPI', url: 'https://humorapi.com' },
    { name: 'icanhazdadjoke', url: 'https://icanhazdadjoke.com' }
  ];

async function getJoke(APIList, type, blacklist, maxLength, { humorAPIKey }) {
  let res;
  const API = APIList[Math.round(Math.random() * APIList.length)];

  try {
    switch (API.name) {
      case 'jokeAPI':
        res = await get(`${API.url}/joke/Any`, {
          timeout: 2500,
          url: 'https://v2.jokeapi.dev/joke/Any',
          params: {
            lang: 'en',
            blacklist: blacklist
          }
        });

        if (res.data.type == 'twopart') {
          res.data.joke =
            `${res.data.setup}\n\n` +
            `||${res.data.delivery}||`;
        }
        break;

      case 'humorAPI':
        res = await get(`${API.url.replace('://', '://api.')}/jokes/random`, {
          timeout: 2500,
          params: {
            'api-key': humorAPIKey,
            'min-rating': 7,
            'max-length': maxLength,
            'include-tags': type,
            'exclude-tags': blacklist,
          }
        });

        if (res.data.joke.includes('Q: ')) {
          response = res.data.joke
            .replace('Q: ', '')
            .replace('A: ', '\n||') + '||\n';
        }
        break;

      case 'icanhazdadjoke':
        res = await get(API.url, {
          timeout: 2500,
          headers: {
            'User-Agent': `My discord bot (https://github.com/${package[0]}/${package[1]})`,
            Accept: 'application/json'
          }
        });
        break;
    }
    return [res.data.joke, API];
  }
  catch (err) {
    if ([402, 403, 522].includes(err.status)) {
      console.error('joke.js: ')
      console.error(err.response)
    }
    else {
      console.error(
        `joke.js: ${API?.url ?? JSON.stringify(API)} responded with error ` +
        `${err.status || err.response?.status}, ${err.statusText || err.response?.statusText}: ${err.response?.data.message}`
      );
    }
  }

  APIList = APIList.filter(str => str.name !== API.name)
  if (APIList) return await getJoke(APIList, type, blacklist, maxLength, client);
}

module.exports = new Command({
  name: 'joke',
  aliases: { prefix: [], slash: [] },
  description: 'sends a joke',
  usage: 'PREFIX Commands: joke [type]',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 100, user: 0 },
  slashCommand: true,
  prefixCommand: true,
  category: 'Fun',
  options: [
    {
      name: 'type',
      description: 'The type/tag of the joke (not all APIList support this)',
      type: 'String',
      required: false,
    },
    {
      name: 'blacklist',
      description: 'blacklist specific joke type/tags.',
      type: 'String',
      required: false,
      choices: [
        { name: 'nsfw', value: 'nsfw' },
        { name: 'religious', value: 'religious' },
        { name: 'political', value: 'political' },
        { name: 'racist', value: 'racist' },
        { name: 'sexist', value: 'sexist' },
        { name: 'explicit', value: 'explicit' }
      ]
    },
    {
      name: 'max_length',
      description: 'the max length of the joke (not all APIList support this)',
      type: 'Number',
      required: false,
      minValue: 10,
      maxValue: 2000
    }
  ],

  run: async ({ keys, functions }, message, interaction) => {

    let type, blacklist, maxLength;

    if (interaction) {
      type = interaction.options.getString('type');
      blacklist = interaction.options.getString('blacklist');
      maxLength = interaction.options.getNumber('max_length') || 2000;
    }
    else type = message.args[0];

    const data = await getJoke(APIList, type, blacklist, maxLength, keys);
    const joke = data?.[0]?.replace(/`/g, `'`);
    const API = data[1];

    if (!joke) {
      if (message) return functions.reply('Apparently, there is currently no API available. Please try again later.', message);
      else return interaction.editReply('Apparently, there is currently no API available. Please try again later.');
    }

    let embed = new EmbedBuilder({
      title: 'Is this funny?',
      description:
        `${joke}\n` +
        `- [${API.name}](${API.url})`
    }).setColor('Random');

    if (message) functions.reply({ embeds: [embed] }, message);
    else interaction.editReply({ embeds: [embed] });

  }
})