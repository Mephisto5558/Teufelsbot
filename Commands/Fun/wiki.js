const
  { Command } = require('reconlx'),
  Wiki = require('wikijs').default,
  { EmbedBuilder, Colors } = require('discord.js'),
  { Repo } = require('../../config.json').Github,
  options = {
    headers: { 'User-Agent': `Discord Bot (${Repo})` }
  };

module.exports = new Command({
  name: 'wiki',
  aliases: { prefix: ['wikipedia'], slash: [] },
  description: 'Search for something on Wikipedia, or get a random page if no search terms were specified.',
  usage: 'wiki <search terms>',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 100, user: 200 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  options: [{
    name: 'query',
    description: 'What do you want to search',
    type: 'String',
    required: true
  }],

  run: async (message, lang, { functions }) => {
    const query = message.options?.getString('query') || message.content;
    let data, joined = '';

    message = await functions.reply(lang('global.loading'), message);

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
          description: ' ',
          color: Colors.White,
          thumbnail: { url: 'https://en.wikipedia.org/static/images/project-logos/enwiki.png' },
          url: page.url(),
          image: image ? { url: image } : undefined,
          fields: Object.entries(info)
            .filter(([e]) => !['name', 'caption'].includes(e) && !e.includes('image'))
            .map(([k, v]) => ({ name: k, value: v.toString(), inline: true }))
        });

      if (summary.length < 2049) embed.data.description = summary.toString();

      await message.edit({ content: '', embeds: [embed] });
      if (embed.data.description == ' ') return;

      let i = 0;
      for (const paragraph of summary.split('\n')) {
        if (i > 3) {
          joined += lang('visitWiki');
          break;
        }
        if (joined.length < 10) joined += `${paragraph}\n`;
        else {
          message.followUp?.(joined) || message.reply(joined);
          joined = `${paragraph}\n`;
          i++
        }
      }

      message.followUp?.(joined) || message.reply(joined);
    }
    catch (err) {
      functions.reply(lang('error', err), message);
    }
  }
})