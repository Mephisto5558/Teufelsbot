const
  { EmbedBuilder } = require('discord.js'),
  { get } = require('axios').default,
  { Github } = require('../../config.json'),
  defaultAPIList = [
    { name: 'jokeAPI', url: 'https://v2.jokeapi.dev' },
    { name: 'humorAPI', url: 'https://humorapi.com' },
    { name: 'icanhazdadjoke', url: 'https://icanhazdadjoke.com' }
  ];

async function getJoke(APIList, type, blacklist, maxLength, { humorAPIKey }) {
  let response;
  const API = APIList.random();

  try {
    switch (API.name) {
      case 'jokeAPI': {
        const res = await get(`${API.url}/joke/Any`, {
          timeout: 2500,
          url: 'https://v2.jokeapi.dev/joke/Any',
          params: {
            lang: 'en',
            blacklist: blacklist
          }
        });

        if (res.data.type == 'twopart') {
          response =
            `${res.data.setup}\n\n` +
            `||${res.data.delivery}||`;
        }
        else response = res.data;

        break;
      }

      case 'humorAPI': {
        const res = await get(`${API.url.replace('://', '://api.')}/jokes/random`, {
          timeout: 2500,
          params: {
            'api-key': humorAPIKey,
            'min-rating': 7,
            'max-length': maxLength,
            'include-tags': type,
            'exclude-tags': blacklist,
          }
        });

        response = res.data.joke.includes('Q: ') ? res.data.joke.replace('Q: ', '').replace('A: ', '\n||') + '||\n' : res.data.joke;
        break;
      }

      case 'icanhazdadjoke': {
        const res = await get(API.url, {
          timeout: 2500,
          headers: {
            'User-Agent': `My discord bot (${Github.Repo})`,
            Accept: 'application/json'
          }
        });

        response = res.data.joke;
        break;
      }
    }
    return [response?.replaceAll('`', "'"), API];
  }
  catch (err) {
    if ([402, 403, 522].includes(err.status)) {
      client.error('joke.js: ')
      client.error(err.response)
    }
    else {
      client.error(
        `joke.js: ${API?.url ?? JSON.stringify(API)} responded with error ` +
        `${err.status || err.response?.status}, ${err.statusText || err.response?.statusText}: ${err.response?.data.message}`
      );
    }
  }

  APIList = APIList.filter(str => str.name !== API.name);
  if (APIList) return getJoke(APIList, type, blacklist, maxLength, { humorAPIKey });
}

module.exports = {
  name: 'joke',
  aliases: { prefix: [], slash: [] },
  description: 'sends a joke',
  usage: 'PREFIX Commands: joke [type]',
  permissions: { client: [], user: [] },
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

  run: async (message, lang, { keys }) => {
    const
      type = message.options?.getString('type') || message.args?.[0],
      blacklist = message.options?.getString('blacklist'),
      maxLength = message.options?.getNumber('max_length') || 2000,
      [joke, API] = await getJoke(defaultAPIList, type, blacklist, maxLength, keys);

    if (!joke) return message.customReply(lang('noAPIAvailable'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description:
        `${joke}\n` +
        `- [${API.name}](${API.url})`
    }).setColor('Random');

   message.customReply({ embeds: [embed] });
  }
}