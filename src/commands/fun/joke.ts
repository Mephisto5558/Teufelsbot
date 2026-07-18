
import { ActionRowBuilder, ButtonBuilder, ButtonStyle, EmbedBuilder, hyperlink } from 'discord.js';
import {constants} from 'node:http2';
import { AllContexts, Command, CommandType, CooldownType, OptionType } from '@mephisto5558/command';
import { HTTP_STATUS_CLOUDFLARE_BLOCKED, commonHeaders, messageMaxLength } from '#utils/constants';


type Joke = { type?: string, joke?: string, setup?: string, delivery?: string };
type APIList = { name: string, link: string, url: string }[];

const
  { HTTP_STATUS_PAYMENT_REQUIRED, HTTP_STATUS_FORBIDDEN } = constants,
  TIMEOUT = 2500,
  defaultAPIList = [
    { name: 'jokeAPI', link: 'https://v2.jokeapi.dev', url: 'https://v2.jokeapi.dev/joke/Any?lang=en&blacklist={blacklist}' },
    {
      name: 'humorAPI', link: 'https://humorapi.com',
      url: 'https://api.humorapi.com/jokes/random?api-key={apiKey}&min-rating=7&max-length={maxLength}&include-tags={includeTags}&exclude-tags={blacklist}'
    },
    { name: 'icanhazdadjoke', link: 'https://icanhazdadjoke.com', url: 'https://icanhazdadjoke.com' }
  ];

function formatAPIUrl(url: string, blacklist: string, apiKey: string, maxLength: number, includeTags: string): string {
  return url
    .replaceAll('{blacklist}', blacklist)
    .replaceAll('{apiKey}', apiKey)
    .replaceAll('{maxLength}', maxLength.toString())
    .replaceAll('{includeTags}', includeTags);
}

async function getJoke(
  this: Client, apiList: APIList = [], type = '', blacklist = '', maxLength = messageMaxLength
): Promise<[string, APIList[number]] | []> {
  const api = apiList.random();
  if (!api) return [];

  let response;

  try {
    const
      timeoutSignal = AbortSignal.timeout(TIMEOUT),
      res = await fetch(formatAPIUrl(api.url, blacklist, process.env.humorAPIKey, maxLength, type), {
        headers: commonHeaders(this),
        signal: timeoutSignal
      });

    if (!res.ok) throw new Error(await res.text());

    const json = await res.json() as Joke | { status: string, code: number, message: string };

    if ('code' in json) throw new DOMException(json.message, json);

    switch (api.name) {
      case 'jokeAPI': response = json.type == 'twopart' ? `${json.setup}\n\n||${json.delivery}||` : json.joke; break;
      case 'humorAPI': response = json.joke?.includes('Q: ') ? json.joke.replace('Q: ', '').replace('A: ', '\n||') + '||\n' : json.joke; break;
      default: response = json.joke; break;
    }
  }
  catch (rawErr) {
    const err = Error.isError(rawErr) ? rawErr : new Error(rawErr);
    if (err instanceof DOMException) {
      if ([HTTP_STATUS_PAYMENT_REQUIRED, HTTP_STATUS_FORBIDDEN, HTTP_STATUS_CLOUDFLARE_BLOCKED].includes(err.code))
        log.error('joke.js: ', err.message);
      else
        log.error(`joke.js: ${JSON.stringify(api)} responded with error ${err.name} ${err.code ? ', ' + err.code.toString() : ''}: ${err.message}`);
    }
    else if (!(err instanceof DOMException)) throw err;
  }

  if (typeof response == 'string') return [response.replaceAll('`', '\''), api];

  apiList = apiList.filter(str => str.name !== api.name);
  return getJoke.call(this, apiList, type, blacklist, maxLength);
}

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  usage: { examples: 'dadjoke' },
  cooldowns: { [CooldownType.Channel]: '100ms' },
  contexts: AllContexts,
  options: [
    {
      name: 'api',
      type: OptionType.String,
      autocompleteOptions: defaultAPIList.map(e => e.name),
      strictAutocomplete: true
    },
    { name: 'type', type: OptionType.String },
    {
      name: 'blacklist',
      type: OptionType.String,
      choices: ['nsfw', 'religious', 'political', 'racist', 'sexist', 'explicit']
    },
    {
      name: 'max_length',
      type: OptionType.Integer,
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
          customId: `${this.commandName}.${apiStr ?? 'null'}.${type ?? 'null'}.${blacklist ?? 'null'}.${maxLength ?? 'null'}`,
          style: ButtonStyle.Primary
        })]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
});