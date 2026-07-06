import { Colors, EmbedBuilder, bold } from 'discord.js';
import { AllContexts, Command, CommandType, CooldownType, OptionType, capitalize } from '@mephisto5558/command';
import wikiInit from 'wikijs';
import { commonHeaders, embedFieldMaxAmt, messageMaxLength, JSON_SPACES } from '#utils/constants.ts';
import { timestamp } from '#utils/timeFormatter.ts';

const MAX_MSGS = 9;

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
      defaultLangWiki = wikiInit({
        headers: commonHeaders(this.client),
        apiUrl: `https://${lang.defaultConfig.defaultLocale}.wikipedia.org/w/api.php`
      }),
      wiki = wikiInit({
        headers: commonHeaders(this.client),
        apiUrl: `https://${this.guild?.localeCode ?? lang.defaultConfig.defaultLocale}.wikipedia.org/w/api.php`
      }),
      result: string | undefined = query ? (await wiki.search(query, 1)).results[0] ?? (await defaultLangWiki.search(query, 1)).results[0] : (await wiki.random(1))[0];

    if (!result) return message.edit(lang('notFound'));

    const
      page = await wiki.page(result),
      { general: info } = await page.fullInfo() as { general: Record<string, unknown[] | Record<string, unknown> | boolean | string> },
      summary = await page.summary(),
      images = await page.images(),
      embed = new EmbedBuilder({
        title: page.title,
        color: Colors.White,
        thumbnail: { url: `https://wikipedia.org/static/images/project-logos/${this.guild.localeCode}wiki.png` },
        url: page.url(),
        image: { url: await page.mainImage() },
        fields: Object.entries(info).reduce<{ name: string, inline: boolean, value: string }[]>((acc, [k, v]) => {
          if (['name', 'image', 'logo', 'alt', 'caption'].some(e => k.toLowerCase().includes(e))) return acc;

          k = capitalize(k.replaceAll(/(?=[A-Z])/g, ' ').toLowerCase().trim());

          // very verbose if, for intellisense
          let value: string;
          if (Array.isArray(v)) value = v.join(', ');
          /* eslint-disable-next-line unicorn/prefer-temporal -- I have no control over this */
          else if (typeof v == 'object') value = v.date instanceof Date ? timestamp(v.date) : JSON.stringify(v, undefined, JSON_SPACES);
          else if (typeof v == 'boolean') value = lang(`global.${v}`);
          /* eslint-disable-next-line @typescript-eslint/no-unnecessary-type-conversion -- possibly not a string, but we aren't able to type it all */
          else value = images.find(e => e.includes(v.toString().replaceAll(' ', '_'))) ?? v.toString();

          acc.push({ name: k, inline: true, value });
          return acc;
        }, []).slice(0, embedFieldMaxAmt)
      }),
      maxSummaryLength = 2049;

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