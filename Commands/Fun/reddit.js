const
  { Collection, EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js'),
  fetch = require('node-fetch').default,
  memeSubreddits = ['funny', 'jokes', 'comedy', 'notfunny', 'bonehurtingjuice', 'ComedyCemetery', 'comedyheaven', 'dankmemes', 'meme'],
  cachedSubreddits = new Collection(),
  fetchPost = ({ children }, filterNSFW=true) => {
    if (filterNSFW) children = children.filter(e => !e.data.over_18);
    if (!children[0]) return;

    const post = children.random().data;

    return {
      title: post.title,
      subreddit: post.subreddit,
      author: post.author,
      upvotes: post.ups ?? 0,
      downvotes: post.downs ?? 0,
      comments: post.num_comments ?? 0,
      ratio: parseFloat(post.upvote_ratio?.toFixed(2) ?? 0),
      url: `https://www.reddit.com${post.permalink}`,
      imageURL: post.media?.oembed?.thumbnail_url ?? post.url,
    };
  };

/**@type {command}*/
module.exports = {
  name: 'reddit',
  cooldowns: { user: 100 },
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
          autocompleteOptions: function () { return (this.focused.value.startsWith('r/') ? this.focused.value.slice(2) : this.focused.value).replace(/\W/g, ''); }
        },
        { name: 'type', type: 'String' },
        { name: 'filter_nsfw', type: 'Boolean' }
      ]
    }
  ],

  run: async function (lang) {
    const
      filterNSFW = !this.channel.nsfw || (this.options?.getBoolean('filter_nsfw') ?? true),
      type = this.options?.getString('type') ?? this.args?.[1] ?? 'hot';

    let subreddit = this.options?.getString('subreddit') ?? this.args?.[0] ?? memeSubreddits.random();
    if (subreddit.startsWith('r/')) subreddit = subreddit.slice(2);
    subreddit = subreddit.replace(/\W/g, '');

    let post;

    if (cachedSubreddits.has(`${subreddit}_${type}`)) post = fetchPost(cachedSubreddits.get(`${subreddit}_${type}`), filterNSFW);
    else {
      let res;
      try { res = await fetch(`https://reddit.com/r/${subreddit}/${type}.json`, { follow: 1 }).then(res => res.json()); }
      catch (err) {
        if (err.type == 'max-redirect') return this.customReply(lang('notFound'));
        throw err;
      }

      if (res.error == 404) return this.customReply(lang('notFound'));
      if (res.reason == 'private') return this.customReply(lang('private'));
      if (res.error) return this.customReply(lang('error', `Error: ${res.message}\nReason: ${res.reason}`));

      cachedSubreddits.set(`${subreddit}_${type}`, res.data);
      setTimeout(() => cachedSubreddits.delete(`${subreddit}_${type}`), 5 * 60000);

      post = fetchPost(res.data, filterNSFW);
    }

    if (!post) return this.customReply(lang('notFound'));

    const
      embed = new EmbedBuilder({
        author: { name: `${post.author} | r/${post.subreddit}` },
        title: post.title.length < 257 ? post.title : post.title.substring(0, 253) + '...',
        url: post.url,
        image: { url: !post.imageURL.match(/^https?:\/\//i) ? `https://reddit.com${post.imageURL}` : post.imageURL },
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