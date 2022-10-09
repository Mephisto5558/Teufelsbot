const
  { EmbedBuilder } = require('discord.js'),
  { get } = require('axios').default,
  { Github } = require('../../config.json'),
  defaultAPIList = [
    { name: 'jokeAPI', url: 'https://v2.jokeapi.dev' },
    { name: 'humorAPI', url: 'https://humorapi.com' },
    { name: 'icanhazdadjoke', url: 'https://icanhazdadjoke.com' }
  ];

async function getJoke(APIList, type, blacklist, maxLength) {
  let response;
  const API = APIList.random();

  try {
    switch (API.name) {
      case 'jokeAPI': {
        const res = await get(`${API.url}/joke/Any`, {
          timeout: 2500,
          url: 'https://v2.jokeapi.dev/joke/Any',
          params: { lang: 'en', blacklist }
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
            'api-key': this.keys.humorAPIKey,
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
            'User-Agent': `Discord bot (${Github.Repo})`,
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
      this.error('joke.js: ');
      this.error(err.response);
    }
    else if (err.code != 'ECONNABORTED') {
      this.error(
        `joke.js: ${API?.url ?? JSON.stringify(API)} responded with error ` +
        `${err.status ?? err.response?.status ?? err.name}, ${err.statusText ?? err.response?.statusText ?? err.code}: ${err.response?.data.message ?? err.message}`
      );
    }
  }

  APIList = APIList.filter(str => str.name !== API.name);
  if (APIList.length) return getJoke.call(this, APIList, type, blacklist, maxLength);
}

module.exports = {
  name: 'joke',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 0 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  category: 'Fun',
  options: [
    { name: 'type', type: 'String' },
    {
      name: 'blacklist',
      type: 'String',
      choices: ['nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit']
    },
    {
      name: 'max_length',
      type: 'Number',
      minValue: 10,
      maxValue: 2000
    }
  ],

  run: async function (lang, client) {
    const
      type = this.options?.getString('type') || this.args?.[0],
      blacklist = this.options?.getString('blacklist'),
      maxLength = this.options?.getNumber('max_length') || 2000,
      [joke, API] = await getJoke.call(client, defaultAPIList, type, blacklist, maxLength);

    if (!joke) return this.customReply(lang('noAPIAvailable'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description:
        `${joke}\n` +
        `- [${API.name}](${API.url})`
    }).setColor('Random');

    this.customReply({ embeds: [embed] });
  }
};