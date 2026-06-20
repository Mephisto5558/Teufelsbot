const
  { Colors, EmbedBuilder } = require('discord.js'),
  { AllContexts, Command, CommandType, CooldownType } = require('@mephisto5558/command'),
  fetch = require('node-fetch').default,
  { constants: { commonHeaders }, getConfig, toMs: { hourToMs } } = require('#Utils');

const
  { github: ghConfig = {} } = getConfig(),
  CACHE_TIMEOUT = hourToMs(12), /* eslint-disable-line @typescript-eslint/no-magic-numbers -- 12h */
  MAX_COMMIT_LENGTH = 100,
  suffix = '...',

  /** @type {{ commitsCache?: string[] }} */
  state = {};

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

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  aliases: { [CommandType.Prefix]: ['changelogs'] },
  cooldowns: { [CooldownType.Channel]: '10s' },
  contexts: AllContexts,
  disabled: !ghConfig.repoName || !ghConfig.userName,
  disabledReason: 'Missing github config in config.json',

  async run(lang) {
    const
      changelog = state.commitsCache ?? await getCommits.call(this.client),
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        url: `${this.client.config.github.repo}/commits`,
        description: changelog.join('\n'),
        color: Colors.White
      });

    if (!state.commitsCache) {
      state.commitsCache = changelog;
      setTimeout(() => {
        delete state.commitsCache;
      }, CACHE_TIMEOUT);
    }

    return this.customReply({ embeds: [embed] });
  }
});