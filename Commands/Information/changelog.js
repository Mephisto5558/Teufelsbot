const
  { Colors, EmbedBuilder } = require('discord.js'),
  fetch = require('node-fetch').default,
  { constants: { commonHeaders }, timeFormatter: { msInSecond }, getConfig, toMs: { hourToMs } } = require('#Utils'),
  { github: ghConfig = {} } = getConfig(),

  CACHE_TIMEOUT = hourToMs(12), /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 12h */
  MAX_COMMIT_LENGTH = 100,
  suffix = '...';


/** @type {string[] | undefined} */
let commitsCache;

/**
 * @this {Client}
 * @returns {Promise<string[]>} */
async function getCommits() {
  const

    // https://docs.github.com/rest/commits/commits#list-commits
    res = await fetch(`https://api.github.com/repos/${this.config.github.userName}/${this.config.github.repoName}/commits?per_page=25`, {
      method: 'GET',
      headers: {
        ...commonHeaders(this),
        Authorization: `Bearer ${process.env.githubKey}`
      }
    }),
    /** @type {{ commit: { message: string } }[]} */ json = await res.json();

  if (!res.ok) throw new Error(JSON.stringify(json));

  return json.map(e => {
    if (e.commit.message.length > MAX_COMMIT_LENGTH) e.commit.message = e.commit.message.slice(0, MAX_COMMIT_LENGTH - suffix.length) + suffix;
    return `- ${e.commit.message.replace(/(?<=\(#\d+\)).*/s, '')}`;
  });
}

/** @type {command<'both', false>} */
module.exports = {
  aliases: { prefix: ['changelogs'] },
  cooldowns: { channel: msInSecond * 10 },
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  disabled: !ghConfig.repoName || !ghConfig.userName,
  disabledReason: 'Missing github config in config.json',

  async run(lang) {
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
      setTimeout(() => {
        commitsCache = undefined;
      }, CACHE_TIMEOUT);
    }

    return this.customReply({ embeds: [embed] });
  }
};