const
  wikiInit = require('wikijs').default,
  { EmbedBuilder, Colors } = require('discord.js'),
  { embedFieldMaxAmt, messageMaxLength } = require('#Utils').constants,
  MAX_MSGS = 9;

/** @type {command<'both', false>}*/
module.exports = {
  usage: { examples: 'discord' },
  aliases: { prefix: ['wikipedia'] },
  cooldowns: { channel: 100, user: 200 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{ name: 'query', type: 'String' }],

  async run(lang) {
    const
      query = this.options?.getString('query') ?? this.content,
      message = await this.customReply(lang('global.loading', getEmoji('loading'))),
      headers = { 'User-Agent': 'Discord Bot' + (this.client.config.github.repo ? ` (${this.client.config.github.repo})` : '') },
      defaultLangWiki = wikiInit({ headers, apiUrl: `https://${this.client.i18n.config.defaultLocale}.wikipedia.org/w/api.php` }),
      wiki = wikiInit({ headers, apiUrl: `https://${this.guild?.localeCode ?? lang.__boundThis__.config.defaultLocale}.wikipedia.org/w/api.php` }),
      result = query ? (await wiki.search(query, 1)).results[0] ?? (await defaultLangWiki.search(query, 1)).results[0] : await wiki.random(1);

    if (!result) return message.edit(lang('notFound'));

    const
      page = await wiki.page(result),

      /** @type {{general: Record<string, unknown[] | Record<string, unknown> | boolean | string>}}*/
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
          /* eslint-disable-next-line @typescript-eslint/strict-boolean-expressions -- TODO: this will be improved, but I'll have to type everything better for that.*/
          if (!v || ['name', 'image', 'logo', 'alt', 'caption'].some(e => k.toLowerCase().includes(e))) return acc;

          k = k.replaceAll(/(?=[A-Z])/g, ' ').toLowerCase().trim();
          k = k[0].toUpperCase() + k.slice(1);

          // very verbose if, for intellisense
          /** @type {string} */
          let value;
          if (Array.isArray(v)) value = v.join(', ');
          else if (typeof v == 'object') value = v.date instanceof Date ? `<t:${Math.round(v.date.getTime() / 1000)}>` : JSON.stringify(v, undefined, 2);
          else if (typeof v == 'boolean') value = lang(`global.${v}`);
          else value = images.find(e => e.includes(v.toString().replaceAll(' ', '_'))) ?? v.toString(); // note: possibly not a string, but weren't able to type it all

          acc.push({ name: k, inline: true, value });
          return acc;
        }, []).slice(0, embedFieldMaxAmt + 1)
      });

    // U+200E (LEFT-TO-RIGHT MARK) is used to make a newline for better spacing;
    const maxSummaryLength = 2049;
    if (summary.length < maxSummaryLength) embed.data.description = `${summary}\n\u200E`;

    await message.edit({ content: '', embeds: [embed] });
    if (embed.data.description) return;

    const msgs = summary.split('\n')
      .flatMap(e => {
        if (e.length < 1000) return [e];

        const halfIndex = Math.floor(e.length / 2);
        const lastIndexBeforeHalf = e.lastIndexOf('.', halfIndex) + 1 || halfIndex;

        return [e.slice(0, lastIndexBeforeHalf), e.slice(lastIndexBeforeHalf)];
      })
      .reduce((acc, e, i, arr) => {
        const accItem = acc.last();

        if (accItem && accItem.length + (arr[i + 1]?.length ?? 0) > messageMaxLength) acc.push(`${e}\n`);
        /* eslint-disable-next-line sonarjs/sonar-no-magic-numbers -- last index*/
        else acc.splice(-1, 1, `${accItem}${e}\n`);

        return acc;
      }, ['']);

    for (const msg of msgs.slice(0, MAX_MSGS)) await this.customReply(msg);
    if (msgs > MAX_MSGS) return this.reply(lang('visitWiki'));
  }
};