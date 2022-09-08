const
  { Octokit } = require('@octokit/core'),
  { EmbedBuilder, Colors } = require('discord.js'),
  { Github } = require('../../config.json');

module.exports = {
  name: 'suggest',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 500, user: 30000 },
  category: 'Others',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
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
      choices: ['Low', 'Medium', 'High']
    }
  ],

  run: async (interaction, lang, client) => {
    const
      octokit = new Octokit({ auth: client.keys.githubKey }),
      title = interaction.options.getString('title'),
      issues = await octokit.request(`GET /repos/${Github.UserName}/${Github.RepoName}/issues`, {});

    if (issues.data.filter(e => e.title == title && e.state == 'open').length)
      return interaction.editReply(lang('alreadySent', issues.data[0].html_url));

    try {
      await octokit.request(`POST /repos/${Github.UserName}/${Github.RepoName}/issues`, {
        title: `${title} | ${interaction.options.getString('importance')} importance`,
        body:
          `<h3>Sent by ${interaction.user.tag} (<code>${interaction.user.id}</code>) with bot <code>${client.user.id}</code></h3>\n\n` +
          interaction.options.getString('suggestion'),
        assignees: [Github.UserName],
        labels: ['enhancement']
      })
    }
    catch (err) {
      interaction.editReply(lang('error', err?.response.statusText));
      throw err;
    }

    const embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', encodeURI(`${Github.Repo}/issues?q=is:open+is:issue+${title} in:title`)),
      color: Colors.Green
    });

    interaction.editReply({ embeds: [embed] });
  }
}