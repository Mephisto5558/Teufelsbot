const
  { Collection, EmbedBuilder } = require('discord.js'),
  fetch = require('node-fetch').default,
  memeSubreddits = ['funny', 'jokes', 'comedy', 'notfunny', 'bonehurtingjuice', 'ComedyCemetery', 'comedyheaven', 'dankmemes', 'meme'],
  cachedSubreddits = new Collection(),
  fetchPost = ({ children }, filterNSFW) => {
    if (filterNSFW) children = children.filter(e => !e.data.over_18);
    if (!children[0]) return;

    const post = children.slice(0, 25).random().data;

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
    }
  };

module.exports = {
  name: 'reddit',
  aliases: { prefix: [], slash: [] },
  description: 'reddit related commands',
  usage: 'reddit [subreddit] [sort type]',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Fun',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'meme',
      description: 'get a random meme',
      type: 'Subcommand',
      options: [{
        name: 'filter_nsfw',
        description: 'filter all posts tagged as nsfw. Default: true, Enforced on non-nsfw channels',
        type: 'Boolean',
        required: false
      }]
    },
    {
      name: 'subreddit',
      description: 'get one of the top posts of a subreddit',
      type: 'Subcommand',
      options: [
        {
          name: 'subreddit',
          description: 'the subreddit name you want to get posts from. Defaults to a random meme sub.',
          type: 'String',
          required: false
        },
        {
          name: 'type',
          description: 'the type to sort. Default: hot',
          type: 'String',
          required: false
        },
        {
          name: 'filter_nsfw',
          description: 'filter all posts tagged as nsfw. Default: true, Enforced on non-nsfw channels',
          type: 'Boolean',
          required: false
        }
      ]
    }
  ],

  run: async (message, lang) => {
    const
      filterNSFW = (message.options?.getBoolean('filter_nsfw') ?? true) || !message.channel.nsfw,
      type = message.options?.getString('type') ?? message.args?.[1] ?? 'hot';

    let subreddit = message.options?.getString('subreddit') ?? message.args?.[0] ?? memeSubreddits.random();
    if (subreddit.startsWith('r/')) subreddit = subreddit.slice(2);

    let post;

    if (cachedSubreddits.has(`${subreddit}_${type}`)) post = fetchPost(cachedSubreddits.get(`${subreddit}_${type}`).data, filterNSFW);
    else {
      const res = await fetch(`https://www.reddit.com/r/${subreddit}/${type}.json`).then(res => res.json());
      if (res.error) return message.customReply(lang('error', `Error: ${res.message}\nReason:${red.reason}`));

      cachedSubreddits.set(`${subreddit}_${type}`, res);
      setTimeout(_ => cachedSubreddits.delete(`${subreddit}_${type}`), 5 * 60 * 1000);

      post = fetchPost(res.data, filterNSFW);
    }

    if (!post) return message.customReply(lang('notFound'));

    const embed = new EmbedBuilder({
      author: { name: `${post.author} | r/${post.subreddit}` },
      title: post.title,
      url: post.url,
      image: { url: post.imageURL },
      footer: { text: lang('embedFooterText', { upvotes: post.upvotes, ratio: post.ratio * 100, downvotes: post.downvotes, comments: post.comments }) }
    }).setColor('Random');

    message.customReply({ embeds: [embed] });
  }
}