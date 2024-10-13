const
  { EmbedBuilder, Colors } = require('discord.js'),
  fetch = require('node-fetch').default,

  /** @type {Client['config']} */
  { github: ghConfig = {} } = require('../../config.json');


/** @type {string[]|undefined} */
let commitsCache;

/**
 * @this {Client}
 * @returns {Promise<string[]>}*/
async function getCommits() {
  const { github } = this.config;

  const
    res = await fetch(`https://api.github.com/repos/${github.userName}/${github.repoName}/commits?per_page=25`, {
      method: 'GET',
      headers: {
        Authorization: `Token ${this.keys.githubKey}`,
        'User-Agent': `Bot ${github.repo}`
      }
    }),

    /** @type {{ commit: { message: string } }[]}*/
    json = await res.json();

  if (!res.ok) throw new Error(JSON.stringify(json));

  return json.map(e => {
    if (e.commit.message.length > 100) e.commit.message = e.commit.message.slice(0, 97) + '...';
    return `- ${e.commit.message.replace(/(?<=\(#\d+\)).*/s, '')}`;
  });
}

/** @type {command<'both', false>}*/
module.exports = {
  aliases: { prefix: ['changelogs'] },
  cooldowns: { channel: 1e4 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !ghConfig.repoName || !ghConfig.userName,
  disabledReason: 'Missing github config in config.json',

  run: async function (lang) {
    const
      changelog = commitsCache ?? await getCommits.call(this.client),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        url: `${this.client.config.github.repo}/commits`,
        description: changelog.join('\n'),
        color: Colors.White
      });

    if (!commitsCache) {
      commitsCache = changelog;
      setTimeout(() => { commitsCache = undefined; }, 432e5); // 12h
    }

    return this.customReply({ embeds: [embed] });
  }
};