/** @import reddit from './reddit' */

const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection, EmbedBuilder, codeBlock } = require('discord.js'),
  { HTTP_STATUS_NOT_FOUND } = require('node:http2').constants,
  fetch = require('node-fetch').default,
  { constants: { embedMaxTitleLength, suffix, maxPercentage }, timeFormatter: { msInSecond, secsInMinute } } = require('#Utils'),

  CACHE_DELETE_TIME = secsInMinute * 5, /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 5min */
  memeSubreddits = ['funny', 'jokes', 'comedy', 'bonehurtingjuice', 'ComedyCemetery', 'comedyheaven', 'dankmemes', 'meme'],
  /** @type {reddit.Cache} */ cachedSubreddits = new Collection();

/**
 * @param {Partial<reddit.RedditPage>} page
 * @param {boolean} filterNSFW */
function fetchPost({ children } = {}, filterNSFW = true) {
  children = children?.filter(e => !e.data.pinned && !e.data.stickied && (!filterNSFW || !e.data.over_18));
  if (!children?.length) return;

  const
    post = children.random().data,
    imageURL = post.media?.oembed?.thumbnail_url ?? post.url;

  return {
    ...post,
    upvoteRatio: `${post.upvote_ratio * maxPercentage}%`,
    downs: post.downs || Math.round(post.ups / post.upvote_ratio - post.ups), // post.downs is always 0 for some reason
    permalink: `https://www.reddit.com${post.permalink}`,
    imageURL: /^https?:\/\//i.test(imageURL) ? imageURL : `https://reddit.com${imageURL}`
  };
}

/** @type {command<'both', false>} */
module.exports = {
  usage: { examples: 'memes hot' },
  cooldowns: { channel: msInSecond / 10 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'meme',
      type: 'Subcommand',
      options: [{ name: 'filter_nsfw', type: 'Boolean' }]
    },
    {
      name: 'subreddit',
      type: 'Subcommand',
      options: [
        {
          name: 'subreddit',
          type: 'String',
          /* eslint-disable-next-line sonarjs/anchor-precedence -- intentional; suggested fix triggers different rule */
          autocompleteOptions(query) { return query.replaceAll(/^r\\|\W/g, ''); }
        },
        { name: 'type', type: 'String' },
        { name: 'filter_nsfw', type: 'Boolean' }
      ]
    }
  ],

  async run(lang) {
    const
      filterNSFW = !this.channel.nsfw || (this.options?.getBoolean('filter_nsfw') ?? true),
      type = this.options?.getString('type') ?? this.args?.[1] ?? 'hot';

    let subreddit = this.options?.getString('subreddit') ?? this.args?.[0] ?? memeSubreddits.random();
    if (subreddit.startsWith('r/')) subreddit = subreddit.slice(2);
    subreddit = subreddit.replaceAll(/\W/g, '');

    let post = fetchPost(cachedSubreddits.get(`${subreddit}_${type}`), filterNSFW);
    if (!post) {
      let /** @type {reddit.RedditResponse | reddit.RedditErrorResponse} */ res;
      try {
        res = await fetch(`https://oauth.reddit.com/r/${subreddit}/${type}.json`, {
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
          },
          follow: 1
        }).then(async res => res.json());
      }
      catch (err) {
        if (err.type != 'max-redirect') throw err;
        return this.customReply(lang('notFound'));
      }

      if ('error' in res) {
        if (res.error == HTTP_STATUS_NOT_FOUND) return this.customReply(lang('notFound'));
        if (res.reason == 'private') return this.customReply(lang('private'));
        return this.customReply(lang('error', codeBlock`Error: ${res.message}\nReason: ${res.reason}`));
      }

      cachedSubreddits.set(`${subreddit}_${type}`, res.data);
      setTimeout(() => void cachedSubreddits.delete(`${subreddit}_${type}`), CACHE_DELETE_TIME);

      post = fetchPost(res.data, filterNSFW);
    }

    if (!post) return this.customReply(lang('notFound'));

    const
      embed = new EmbedBuilder({
        author: { name: `${post.author} | ${post.subreddit_name_prefixed}` },
        title: post.title.length > embedMaxTitleLength ? post.title.slice(0, embedMaxTitleLength - suffix.length) + suffix : post.title,
        url: post.permalink,
        image: { url: post.imageURL },
        footer: { text: lang('embedFooterText', { upvotes: post.ups, ratio: post.upvoteRatio, downvotes: post.downs, comments: post.num_comments }) }
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('global.anotherone'),
            customId: `${this.commandName}.${post.subreddit}.${type}.${filterNSFW}`,
            style: ButtonStyle.Primary
          }),
          new ButtonBuilder({
            label: lang('global.downloadButton'),
            url: post.imageURL,
            style: ButtonStyle.Link
          })
        ]
      });

    return this.customReply({ embeds: [embed], components: [component] });
  }
};