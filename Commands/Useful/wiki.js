const
  wiki = require('wikijs').default,
  { EmbedBuilder, Colors } = require('discord.js'),
  { Repo } = require('../../config.json').Github,
  options = { headers: { 'User-Agent': `Discord Bot (${Repo})` } };

/**@type {command}*/
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
      if (query) data = await wiki(options).search(query, 1);
      else {
        const results = await wiki(options).random(1);
        data = await wiki(options).search(results[0], 1);
      }

      if (!data.results.length) return message.edit(lang('notFound'));

      const
        page = await wiki(options).page(data.results[0]),
        { general: info } = await page.fullInfo(),
        image = await page.mainImage(),
        summary = await page.summary(),
        embed = new EmbedBuilder({
          title: data.results[0],
          color: Colors.White,
          thumbnail: { url: 'https://wikipedia.org/static/images/project-logos/enwiki.png' },
          url: page.url(),
          image: { url: image },
          fields: Object.entries(info).reduce((acc, [k, v]) => {
            if (!['name', 'caption'].includes(k) && !k.includes('image')) acc.push({ name: k, value: v.toString(), inline: true });
            return acc;
          }, [])

        });

      if (summary.length < 2049) embed.data.description = summary;

      await message.edit({ content: '', embeds: [embed] });
      if (embed.data.description) return;

      let joined = '';
      let msgs = 0;
      for (const line of summary.split('\n')) {
        if (msgs > 9) {
          joined += lang('visitWiki');
          break;
        }

        if (joined.length >= 2000) {
          await this.customReply(joined);
          msgs++;
          joined = '';
        }

        joined += `${line}\n`;
      }

      if (joined) return this.customReply(joined);
    }
    catch (err) {
      if (this.client.botType == 'dev') throw err;
      return this.customReply(lang('error', err.message));
    }
  }
};