const
  fetch = require('node-fetch'),
  { EmbedBuilder } = require('discord.js'),
  { Github } = require('../../config.json'),
  defaultAPIList = [
    { name: 'jokeAPI', link: 'https://v2.jokeapi.dev', url: 'https://v2.jokeapi.dev/joke/Any' },
    { name: 'humorAPI', link: 'https://humorapi.com', url: 'https://api.humorapi.com/jokes/random' },
    { name: 'icanhazdadjoke', link: 'https://icanhazdadjoke.com', url: 'https://icanhazdadjoke.com' }
  ];

/**@this {import('discord.js').Client}*/
async function getJoke(APIList = [], type = '', blacklist = '', maxLength = 2000) {
  const API = APIList.random();
  let response;

  try {
    switch (API.name) {
      case 'jokeAPI': {
        const res = await fetch(`${API.url}?lang=en&blacklist=${blacklist}`, { timeout: 2500 }).then(e => e.json());

        if (res.type == 'twopart') response = `${res.setup}\n\n||${res.delivery}||`;
        else response = res.joke;

        break;
      }

      case 'humorAPI': {
        const res = await fetch(`${API.url}?api-key=${this.keys.humorAPIKey}&min-rating=7&max-length=${maxLength}&include-tags=${type}&exclude-tags=${blacklist}`, { timeout: 2500 }).then(e => e.json());

        response = res.joke.includes('Q: ') ? res.joke.replace('Q: ', '').replace('A: ', '\n||') + '||\n' : res.joke;
        break;
      }

      case 'icanhazdadjoke': {
        const res = await fetch(API.url, {
          headers: {
            'User-Agent': `Discord bot (${Github.Repo})`,
            Accept: 'application/json'
          }
        }).then(e => e.json());

        response = res.joke;
        break;
      }
    }
  }
  catch (err) {
    if ([402, 403, 522].includes(err.status)) {
      this.error('joke.js: ');
      this.error(err.response);
    }
    else if (err.name !== 'AbortError')
      this.error(`joke.js: ${API?.url ?? JSON.stringify(API)} responded with error ${err.status ?? err.response?.status ?? err.name}, ${err.statusText ?? err.response?.statusText ?? err.code}: ${err.response?.data.message ?? err.message}`);
  }

  if (typeof response == 'string') return [response.replaceAll('`', '\''), API];

  APIList = APIList.filter(str => str.name !== API.name);
  if (APIList.length) return getJoke.call(this, APIList, type, blacklist, maxLength);
}

module.exports = {
  name: 'joke',
  cooldowns: { guild: 100 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'api',
      type: 'String',
      autocompleteOptions: defaultAPIList.map(e => e.name),
      strictAutocomplete: true
    },
    { name: 'type', type: 'String' },
    {
      name: 'blacklist',
      type: 'String',
      choices: ['nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit']
    },
    {
      name: 'max_length',
      type: 'Integer',
      minValue: 10,
      maxValue: 2000
    }
  ],

  run: async function (lang) {
    const
      api = this.options?.getString('api'),
      type = this.options?.getString('type') || this.args?.[0],
      blacklist = this.options?.getString('blacklist'),
      maxLength = this.options?.getInteger('max_length'),
      [joke, API] = await getJoke.call(this.client, api ? [defaultAPIList.find(e => e.name == api)] : defaultAPIList, type, blacklist, maxLength);

    if (!joke) return this.customReply(lang('noAPIAvailable'));

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: `${joke}\n- [${API.name}](${API.link})`
    }).setColor('Random');

    return this.customReply({ embeds: [embed] });
  }
};