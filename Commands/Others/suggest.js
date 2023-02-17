const
  { EmbedBuilder, Colors } = require('discord.js'),
  { Github } = require('../../config.json'),
  issuesEndpoint = `https://api.github.com/repos/${Github.UserName}/${Github.RepoName}/issues`;

module.exports = {
  name: 'suggest',
  cooldowns: { guild: 500, user: 3e4 },
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  dmPermission: true,
  options: [
    {
      name: 'title',
      type: 'String',
      required: true
    },
    {
      name: 'suggestion',
      type: 'String',
      required: true
    },
    {
      name: 'importance',
      type: 'String',
      required: true,
      choices: ['low', 'medium', 'hight']
    }
  ],

  run: async function (lang) {
    const
      title = this.options.getString('title'),
      issues = await fetch(issuesEndpoint, {
        headers: {
          Authorization: `Token ${this.client.keys.githubKey}`,
          'User-Agent': `Bot ${Github.Repo}`
        }
      }).then(e => e.json());

    if (issues.filter(e => e.title == title && e.state == 'open').length)
      return this.editReply(lang('alreadySent', issues[0].html_url));

    try {
      await fetch(issuesEndpoint, {
        method: 'POST',
        headers: {
          Authorization: `Token ${this.client.keys.githubKey}`,
          'User-Agent': `Bot ${Github.Repo}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          title: `${title} | ${this.options.getString('importance')} importance`,
          body:
            `<h3>Sent by ${this.user.tag} (<code>${this.user.id}</code>) with bot <code>${this.client.user.id}</code></h3>\n\n` +
            this.options.getString('suggestion'),
          labels: ['enhancement']
        })
      });
    }
    catch (err) {
      this.editReply(lang('error', err?.response.statusText));
      throw err;
    }

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', encodeURI(`${Github.Repo}/issues?q=is:open+is:issue+${title} in:title`)),
      color: Colors.Green
    });

    return this.editReply({ embeds: [embed] });
  }
};