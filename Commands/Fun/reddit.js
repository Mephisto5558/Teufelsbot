const
  { Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  fetch = require('node-fetch').default,
  { HTTP_STATUS_NOT_FOUND } = require('node:http2').constants,
  { secsInMinute } = require('#Utils/timeFormatter'),
  CACHE_DELETE_TIME = secsInMinute * 5, // eslint-disable-line sonarjs/sonar-no-magic-numbers -- 5min
  MAX_TITLE_LENGTH = 257,
  suffix = '...',
  memeSubreddits = ['funny', 'jokes', 'comedy', 'notfunny', 'bonehurtingjuice', 'ComedyCemetery', 'comedyheaven', 'dankmemes', 'meme'],
  cachedSubreddits = new Collection(),
  fetchPost = ({ children }, filterNSFW = true) => {
    children = children.filter(e => !e.data.pinned && !e.data.stickied && (!filterNSFW || !e.data.over_18));
    if (!children.length) return;

    const post = children.random().data;

    return {
      title: post.title,
      subreddit: post.subreddit,
      author: post.author,
      upvotes: post.ups ?? 0,
      downvotes: post.downs ?? 0,
      comments: post.num_comments ?? 0,
      ratio: Number.parseFloat(post.upvote_ratio?.toFixed(2) ?? 0),
      url: `https://www.reddit.com${post.permalink}`,
      imageURL: post.media?.oembed?.thumbnail_url ?? post.url
    };
  };

/** @type {command<'both', false>}*/
module.exports = {
  usage: { examples: 'memes hot' },
  cooldowns: { channel: 100 },
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
          autocompleteOptions() { return (this.focused.value.startsWith('r/') ? this.focused.value.slice(2) : this.focused.value).replaceAll(/\W/g, ''); }
        },
        { name: 'type', type: 'String' },
        { name: 'filter_nsfw', type: 'Boolean' }
      ]
    }
  ],
  disabled: true,
  disabledReason: 'Reddit has blocked the bot\'s IP.',

  async run(lang) {
    const
      filterNSFW = !this.channel.nsfw || (this.options?.getBoolean('filter_nsfw') ?? true),
      type = this.options?.getString('type') ?? this.args?.[1] ?? 'hot';

    let subreddit = this.options?.getString('subreddit') ?? this.args?.[0] ?? memeSubreddits.random();
    if (subreddit.startsWith('r/')) subreddit = subreddit.slice(2);
    subreddit = subreddit.replaceAll(/\W/g, '');

    let post;

    if (cachedSubreddits.has(`${subreddit}_${type}`)) post = fetchPost(cachedSubreddits.get(`${subreddit}_${type}`), filterNSFW);
    else {
      let res;
      try { res = await fetch(`https://reddit.com/r/${subreddit}/${type}.json`, { follow: 1 }).then(res => res.json()); }
      catch (err) {
        if (err.type != 'max-redirect') throw err;
        return this.customReply(lang('notFound'));
      }

      if (res.error == HTTP_STATUS_NOT_FOUND) return this.customReply(lang('notFound'));
      if (res.reason == 'private') return this.customReply(lang('private'));
      if (res.error) return this.customReply(lang('error', `Error: ${res.message}\nReason: ${res.reason}`));

      cachedSubreddits.set(`${subreddit}_${type}`, res.data);
      setTimeout(() => cachedSubreddits.delete(`${subreddit}_${type}`), CACHE_DELETE_TIME);

      post = fetchPost(res.data, filterNSFW);
    }

    if (!post) return this.customReply(lang('notFound'));

    const
      embed = new EmbedBuilder({
        author: { name: `${post.author} | r/${post.subreddit}` },
        title: post.title.length < MAX_TITLE_LENGTH ? post.title : post.title.slice(0, MAX_TITLE_LENGTH - suffix.length) + suffix,
        url: post.url,
        image: { url: /^https?:\/\//i.test(post.imageURL) ? post.imageURL : `https://reddit.com${post.imageURL}` },
        footer: { text: lang('embedFooterText', { upvotes: post.upvotes, ratio: post.ratio * 100, downvotes: post.downvotes, comments: post.comments }) }
      }).setColor('Random'),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: lang('global.anotherone'),
            customId: `reddit.${subreddit}.${type}.${filterNSFW}`,
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