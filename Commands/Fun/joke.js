const
  { default: fetch, AbortError, FetchError } = require('node-fetch'),
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, hyperlink } = require('discord.js'),
  { HTTP_STATUS_PAYMENT_REQUIRED, HTTP_STATUS_FORBIDDEN } = require('node:http2').constants,
  { constants: { messageMaxLength, HTTP_STATUS_CLOUDFLARE_BLOCKED }, timeFormatter: { msInSecond } } = require('#Utils'),
  TIMEOUT = 2500,
  defaultAPIList = [
    { name: 'jokeAPI', link: 'https://v2.jokeapi.dev', url: 'https://v2.jokeapi.dev/joke/Any?lang=en&blacklist={blacklist}' },
    {
      name: 'humorAPI', link: 'https://humorapi.com',
      url: 'https://api.humorapi.com/jokes/random?api-key={apiKey}&min-rating=7&max-length={maxLength}&include-tags={includeTags}&exclude-tags={blacklist}'
    },
    { name: 'icanhazdadjoke', link: 'https://icanhazdadjoke.com', url: 'https://icanhazdadjoke.com' }
  ];

/**
 * @param {string} url
 * @param {string} blacklist
 * @param {string} apiKey
 * @param {string} maxLength
 * @param {string} includeTags */
function formatAPIUrl(url, blacklist, apiKey, maxLength, includeTags) {
  return url
    .replaceAll('{blacklist}', blacklist)
    .replaceAll('{apiKey}', apiKey)
    .replaceAll('{maxLength}', maxLength)
    .replaceAll('{includeTags}', includeTags);
}

/**
 * @this {Client}
 * @param {{ name: string, link: string, url: string }[]} apiList
 * @param {string} type
 * @param {string} blacklist
 * @param {number?} maxLength
 * @returns {Promise<[string, { name: string, link: string, url: string }] | []>} */
async function getJoke(apiList = [], type = '', blacklist = '', maxLength = messageMaxLength) {
  const api = apiList.random();
  let response;

  try {
    const timeoutSignal = new AbortController();
    setTimeout(() => timeoutSignal.abort(), TIMEOUT);

    /** @type {{ type?: string, joke?: string, setup?: string, delivery?: string }} */
    const res = await fetch(formatAPIUrl(api.url, blacklist, process.env.humorAPIKey, maxLength, type), {
      headers: {
        'User-Agent': `Discord bot (${this.config.github.repo})`,
        Accept: 'application/json'
      },
      signal: timeoutSignal.signal
    }).then(e => e.json());

    switch (api.name) {
      case 'jokeAPI': response = res.type == 'twopart' ? `${res.setup}\n\n||${res.delivery}||` : res.joke; break;
      case 'humorAPI': response = res.joke?.includes('Q: ') ? res.joke.replace('Q: ', '').replace('A: ', '\n||') + '||\n' : res.joke; break;
      default: response = res.joke; break;
    }
  }
  catch (err) {
    if ([HTTP_STATUS_PAYMENT_REQUIRED, HTTP_STATUS_FORBIDDEN, HTTP_STATUS_CLOUDFLARE_BLOCKED].includes(err.status))
      log.error('joke.js: ', err.response);
    else if (err instanceof FetchError)
      log.error(`joke.js: ${api?.url ?? JSON.stringify(api)} responded with error ${err.name} ${err.code ? ', ' + err.code : ''}: ${err.message}`);
    else if (!(err instanceof AbortError)) throw err;
  }

  if (typeof response == 'string') return [response.replaceAll('`', '\''), api];

  apiList = apiList.filter(str => str.name !== api.name);
  return apiList.length ? getJoke.call(this, apiList, type, blacklist, maxLength) : [];
}

/** @type {command<'both', false>} */
module.exports = {
  usage: { examples: 'dadjoke' },
  cooldowns: { channel: msInSecond / 10 },
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
      maxValue: messageMaxLength
    }
  ],

  async run(lang) {
    const
      apiStr = this.options?.getString('api'),
      type = this.options?.getString('type') ?? this.args?.[0],
      blacklist = this.options?.getString('blacklist'),
      maxLength = this.options?.getInteger('max_length'),
      [joke, api] = await getJoke.call(
        this.client, apiStr ? [defaultAPIList.find(e => e.name == apiStr)] : defaultAPIList,
        type, blacklist, maxLength
      );

    if (!joke || !api) return this.customReply(lang('noAPIAvailable'));

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: `${joke}\n- ${hyperlink(api.name, api.link)}`
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [new ButtonBuilder({
          label: lang('global.anotherone'),
          customId: `${this.commandName}.${api.name}.${type ?? 'null'}.${blacklist ?? 'null'}.${maxLength ?? 'null'}`,
          style: ButtonStyle.Primary
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};