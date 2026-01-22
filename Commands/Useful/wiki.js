/** @import wikijs from '../../node_modules/wikijs/index' */

const
  { Colors, EmbedBuilder, bold } = require('discord.js'),
  { Command, capitalize, commandTypes } = require('@mephisto5558/command'),
  /** @type {wikijs} */ { default: wikiInit } = require('wikijs'),
  { constants: { commonHeaders, embedFieldMaxAmt, messageMaxLength, JSON_SPACES }, timeFormatter: { msInSecond, timestamp } } = require('#Utils'),

  MAX_MSGS = 9;

module.exports = new Command({
  types: [commandTypes.slash, commandTypes.prefix],
  usage: { examples: 'discord' },
  aliases: { [commandTypes.prefix]: ['wikipedia'] },
  cooldowns: { channel: msInSecond / 10, user: msInSecond / 10 * 2 },
  dmPermission: true,
  options: [{ name: 'query', type: 'String' }],

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

      /** @type {string | undefined} */
      result = query ? (await wiki.search(query, 1)).results[0] ?? (await defaultLangWiki.search(query, 1)).results[0] : (await wiki.random(1))[0];

    if (!result) return message.edit(lang('notFound'));

    const
      page = await wiki.page(result),

      /** @type {{ general: Record<string, unknown[] | Record<string, unknown> | boolean | string> }} */
      { general: info } = await page.fullInfo(),
      summary = await page.summary(),
      images = await page.images(),
      embed = new EmbedBuilder({
        title: page.title,
        color: Colors.White,
        thumbnail: { url: `https://wikipedia.org/static/images/project-logos/${this.guild.localeCode}wiki.png` },
        url: page.url(),
        image: { url: await page.mainImage() },
        fields: Object.entries(info).reduce((acc, [k, v]) => {
          if (['name', 'image', 'logo', 'alt', 'caption'].some(e => k.toLowerCase().includes(e))) return acc;

          k = capitalize(k.replaceAll(/(?=[A-Z])/g, ' ').toLowerCase().trim());

          // very verbose if, for intellisense
          /** @type {string} */
          let value;
          if (Array.isArray(v)) value = v.join(', ');
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
    if (summary.length < maxSummaryLength) embed.data.description = `${summary}\n\u200E`;

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
        else acc.splice(-1, 1, `${accItem}${e}\n`);

        return acc;
      }, ['']);

    for (const msg of msgs.slice(0, MAX_MSGS)) await this.customReply(msg);

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-return -- false positive - appears to be to complex for TS to understand(?) */
    if (msgs.length > MAX_MSGS) return this.reply(bold(lang('visitWiki')));
  }
});