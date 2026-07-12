import { Colors, EmbedBuilder, bold } from 'discord.js';
import { TTLCache } from '@isaacs/ttlcache';
import { AllContexts, Command, CommandType, CooldownType, OptionType, capitalize } from '@mephisto5558/command';
import fetch from 'node-fetch';
import { JSON_SPACES, commonHeaders, embedFieldMaxAmt, messageMaxLength } from '#utils/constants.ts';
import { daysInWeek, timestamp } from '#utils/timeFormatter.ts';
import type { Locale } from '@mephisto5558/i18n';

/* eslint-disable-next-line @typescript-eslint/consistent-indexed-object-style -- better readability */
type WikiDataResponse<Action extends string, Mode extends string, Data = { title?: string }[]> = { [A in Action]?: { [M in Mode]?: Data } };

type WikiSearchResponse = WikiDataResponse<'query', 'search'>;
type WikiRandomResponse = WikiDataResponse<'query', 'random'>;
type WikiPageDataResponse = WikiDataResponse<'query', 'pages', Record<string, {
  title: string;
  extract?: string;
  fullurl?: string;
  images?: { title?: string }[];
  pageimages?: { source?: string }[];
} | undefined>>;

type WikiTextResponse = WikiDataResponse<'parse', 'wikitext', { '*'?: string }>;

type CacheEntry = {
  title: string;
  summary: string;
  fullurl: string | undefined;
  mainImage: string | undefined;
  images: string[];
  info: Record<string, unknown>;
};

const
  MAX_MSGS = 9,
  cache = new TTLCache<string, CacheEntry>({ ttl: Temporal.Duration.from({ days: daysInWeek }).milliseconds });


async function fetchWiki<Ret>(client: Client, locale: Locale, additionalParams: string, action = 'query'): Promise<Ret> {
  const res = await fetch(`https://${locale}.wikipedia.org/w/api.php?action=${action}&${additionalParams}${action == 'query' ? '&srlimit=1' : ''}&format=json&origin=*`, { headers: commonHeaders(client) });
  /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- needed */
  return res.json() as Promise<Ret>;
}

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  usage: { examples: 'discord' },
  aliases: { [CommandType.Prefix]: ['wikipedia'] },
  cooldowns: { [CooldownType.Channel]: '100ms', [CooldownType.User]: '200ms' },
  contexts: AllContexts,
  options: [{ name: 'query', type: OptionType.String }],

  async run(lang) {
    const
      query = this.options?.getString('query') ?? this.content,
      message = await this.customReply(lang('global.loading', this.client.application.getEmoji('loading'))),
      guildLocale = this.guild?.localeCode ?? lang.defaultConfig.defaultLocale;

    let
      cacheKey,
      title: CacheEntry['title'] | undefined,
      summary: CacheEntry['summary'] | undefined,
      fullurl: CacheEntry['fullurl'],
      mainImage: CacheEntry['mainImage'],
      images: CacheEntry['images'] = [],
      info: CacheEntry['info'] = {};

    if (query) {
      cacheKey = `${guildLocale}:${query.toLowerCase().trim()}`;

      const entry = cache.get(cacheKey);
      if (entry) ({ title, summary, fullurl, mainImage, images = [], info = {} } = entry);
    }

    if (!title) { // cache miss
      let result: string | undefined;

      if (query) {
        result = (await fetchWiki<WikiSearchResponse>(this.client, guildLocale, `list=search&srsearch=${encodeURIComponent(query)}`))
          .query?.search?.[0]?.title;

        if (!result && guildLocale != lang.defaultConfig.defaultLocale) {
          result = (
            await fetchWiki<WikiSearchResponse>(this.client, lang.defaultConfig.defaultLocale, `list=search&srsearch=${encodeURIComponent(query)}`)
          ).query?.search?.[0]?.title;
        }
      }
      else
        result = (await fetchWiki<WikiRandomResponse>(this.client, guildLocale, 'list=random&rnnamespace=0')).query?.random?.[0]?.title;

      if (!result) return message.edit(lang('notFound'));

      const pageData = (await fetchWiki<WikiPageDataResponse>(
          this.client, guildLocale,
          `prop=extracts|info|images|pageimages&exintro=1&explaintext=1&inprop=url&piprop=original&titles=${encodeURIComponent(result)}`
        )).query?.pages ?? {},
        pageId = Object.keys(pageData)[0],
        page = pageId ? pageData[pageId] : undefined;

      if (!page) return message.edit(lang('notFound'));

      try {
        const
          lines = (await fetchWiki<WikiTextResponse>(this.client, guildLocale, `page=${encodeURIComponent(result)}&prop=wikitext&section=0`, 'parse'))
            .parse?.wikitext?.['*']?.split('\n') ?? [];

        for (let line of lines) {
          line = line.trim();
          if (!line.startsWith('|') || !line.includes('=')) continue;

          const match = /^\|(?<key>[^=]+)=(?<value>.+)/.exec(line);
          if (match?.groups?.key && match.groups.value)
            info[match.groups.key.trim()] = match.groups.value.trim();
        }
      }
      catch { /* ignored */ }

      ({ title, fullurl, mainImage, images, info } = page);

      summary = page.extract ?? '';

      /* eslint-disable-next-line@typescript-eslint/prefer-nullish-coalescing */
      mainImage = page.pageimages?.[0]?.source || undefined;
      images = page.images?.map(img => img.title).filter(Boolean) ?? [];

      cache.set(title, { title, summary, fullurl, mainImage, images, info });
      if (cacheKey)
        cache.set(cacheKey, { title, summary, fullurl, mainImage, images, info });
    }

    const embed = new EmbedBuilder({
      title,
      color: Colors.White,
      thumbnail: { url: `https://wikipedia.org/static/images/project-logos/${guildLocale}wiki.png` },
      fields: Object.entries(info).reduce<{ name: string; inline: boolean; value: string }[]>((acc, [k, v]) => {
        if (['name', 'image', 'logo', 'alt', 'caption'].some(e => k.toLowerCase().includes(e))) return acc;

        k = capitalize(k.replaceAll(/(?=[A-Z])/g, ' ').toLowerCase().trim());

        let value: string;
        if (Array.isArray(v)) value = v.join(', ');
        else if (typeof v == 'object') {
          /* eslint-disable-next-line unicorn/prefer-temporal -- needed */
          if (v && 'date' in v && v.date instanceof Date) value = timestamp(Temporal.Instant.fromEpochMilliseconds(v.date.getTime()));
          else value = JSON.stringify(v, undefined, JSON_SPACES) ?? '';
        }
        else if (typeof v == 'boolean') value = lang(`global.${v}`);
        /* eslint-disable-next-line @typescript-eslint/no-base-to-string -- intentional */
        else if (v) value = images.find(e => !!e?.includes(v.toString().replaceAll(' ', '_'))) ?? v.toString();
        else value = '';

        acc.push({ name: k, inline: true, value });
        return acc;
      }, []).slice(0, embedFieldMaxAmt)
    });

    if (fullurl) embed.data.url = fullurl;
    if (mainImage) embed.data.image = { url: mainImage };

    const maxSummaryLength = 2049;

    // U+200E (LEFT-TO-RIGHT MARK) is used to make a newline for better spacing.
    if (summary.length < maxSummaryLength) embed.data.description = `${summary}\n\u{200E}`;

    await message.edit({ content: '', embeds: [embed] });
    if (embed.data.description) return;

    const msgs = summary.split('\n')
      .flatMap(e => {
        if (e.length < messageMaxLength) return [e];

        const
          halfIndex = Math.floor(e.length / 2),
          lastIndexBeforeHalf = e.lastIndexOf('.', halfIndex) + 1 || halfIndex;

        return [e.slice(0, lastIndexBeforeHalf), e.slice(lastIndexBeforeHalf)];
      })
      .reduce((acc, e, i, arr) => {
        const accItem = acc.at(-1);

        if (accItem && accItem.length + (arr[i + 1]?.length ?? 0) > messageMaxLength) acc.push(`${e}\n`);
        else acc[acc.length - 1] = `${accItem}${e}\n`;

        return acc;
      }, ['']);

    for (const msg of msgs.slice(0, MAX_MSGS)) await this.customReply(msg);


    if (msgs.length > MAX_MSGS) return this.reply(bold(lang('visitWiki')));
  }
});