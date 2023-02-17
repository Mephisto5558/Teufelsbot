const
  Wiki = require('wikijs').default,
  { EmbedBuilder, Colors } = require('discord.js'),
  { Repo } = require('../../config.json').Github,
  options = { headers: { 'User-Agent': `Discord Bot (${Repo})` } };

module.exports = {
  name: 'wiki',
  aliases: { prefix: ['wikipedia'] },
  cooldowns: { guild: 100, user: 200 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'query',
    type: 'String',
    required: true
  }],

  run: async function (lang) {
    const
      query = this.options?.getString('query') || this.content,
      message = await this.customReply(lang('global.loading'));

    let data;

    try {
      if (query) data = await Wiki(options).search(query, 1);
      else {
        const results = await Wiki(options).random(1);
        data = await Wiki(options).search(results[0], 1);
      }

      if (!data.results.length) return message.edit(lang('notFound'));

      const
        page = await Wiki(options).page(data.results[0]),
        { general: info } = await page.fullInfo(),
        image = await page.mainImage(),
        summary = await page.summary(),
        embed = new EmbedBuilder({
          title: data.results[0],
          color: Colors.White,
          thumbnail: { url: 'https://wikipedia.org/static/images/project-logos/enwiki.png' },
          url: page.url(),
          image: { url: image },
          fields: Object.entries(info)
            .filter(([e]) => !['name', 'caption'].includes(e) && !e.includes('image'))
            .map(([k, v]) => ({ name: k, value: v.toString(), inline: true }))
        });

      if (summary.length < 2049) embed.data.description = summary;

      await message.edit({ content: '', embeds: [embed] });
      if (!embed.data.description) return;

      let joined = summary.split('\n').reduce((acc, e) => {
        if (acc.length >= 2000) {
          this.customReply(acc);
          acc = '';
        }
        return acc + `${e}\n`;
      }, '');

      if (joined.split('\n').length > 3) joined += lang('visitWiki');

      return this.customReply(joined);
    }
    catch (err) { return this.customReply(lang('error', err.message)); }
  }
};