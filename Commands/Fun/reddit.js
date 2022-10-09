const
  { Collection, EmbedBuilder } = require('discord.js'),
  fetch = require('node-fetch').default,
  memeSubreddits = ['funny', 'jokes', 'comedy', 'notfunny', 'bonehurtingjuice', 'ComedyCemetery', 'comedyheaven', 'dankmemes', 'meme'],
  cachedSubreddits = new Collection(),
  fetchPost = ({ children }, filterNSFW) => {
    if (filterNSFW) children = children.filter(e => !e.data.over_18);
    if (!children[0]) return;

    const post = children.slice(0, 100).random().data;

    return {
      title: post.title,
      subreddit: post.subreddit,
      author: post.author,
      upvotes: post.ups ?? 0,
      downvotes: post.downs ?? 0,
      comments: post.num_comments ?? 0,
      ratio: parseFloat(post.upvote_ratio?.toFixed(2) ?? 0),
      url: `https://www.reddit.com${post.permalink}`,
      imageURL: post.media?.oembed?.thumbnail_url || post.url,
    };
  };

module.exports = {
  name: 'reddit',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Fun',
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
        { name: 'subreddit', type: 'String' },
        { name: 'type', type: 'String' },
        { name: 'filter_nsfw', type: 'Boolean' }
      ]
    }
  ],

  run: async function (lang) {
    const
      filterNSFW = (this.options?.getBoolean('filter_nsfw') ?? true) || !this.channel.nsfw,
      type = this.options?.getString('type') ?? this.args?.[1] ?? 'hot';

    let subreddit = this.options?.getString('subreddit') ?? this.args?.[0] ?? memeSubreddits.random();
    if (subreddit.startsWith('r/')) subreddit = subreddit.slice(2);

    let post;

    if (cachedSubreddits.has(`${subreddit}_${type}`)) post = fetchPost(cachedSubreddits.get(`${subreddit}_${type}`).data, filterNSFW);
    else {
      const res = await fetch(`https://www.reddit.com/r/${subreddit}/${type}.json`).then(res => res.json());
      if (res.error) return this.customReply(lang('error', `Error: ${res.message}\nReason:${red.reason}`));

      cachedSubreddits.set(`${subreddit}_${type}`, res);
      setTimeout(() => cachedSubreddits.delete(`${subreddit}_${type}`), 5 * 60 * 1000);

      post = fetchPost(res.data, filterNSFW);
    }

    if (!post) return this.customReply(lang('notFound'));

    const embed = new EmbedBuilder({
      author: { name: `${post.author} | r/${post.subreddit}` },
      title: post.title,
      url: post.url,
      image: { url: post.imageURL },
      footer: { text: lang('embedFooterText', { upvotes: post.upvotes, ratio: post.ratio * 100, downvotes: post.downvotes, comments: post.comments }) }
    }).setColor('Random');

    this.customReply({ embeds: [embed] });
  }
};