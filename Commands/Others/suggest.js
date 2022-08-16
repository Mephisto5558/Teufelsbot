const
  { Command } = require('reconlx'),
  { Octokit } = require('@octokit/core'),
  { EmbedBuilder, Colors } = require('discord.js'),
  { Github } = require('../../config.json');

module.exports = new Command({
  name: 'suggest',
  aliases: { prefix: [], slash: [] },
  description: 'Suggest a feature for the bot on Github.',
  usage: '',
  permissions: { client: ['EmbedLinks'], user: [] },
  cooldowns: { guild: 0, user: 5000 },
  category: 'Others',
  slashCommand: true,
  prefixCommand: false,
  ephemeralDefer: true,
  options: [
    {
      name: 'title',
      description: 'the title of your suggestion',
      type: 'String',
      required: true
    },
    {
      name: 'suggestion',
      description: 'your suggestion. Gets send to github.',
      type: 'String',
      required: true
    },
    {
      name: 'importance',
      description: 'how important you think your suggestion is',
      type: 'String',
      required: true,
      choices: [
        { name: 'low', value: 'Low' },
        { name: 'medium', value: 'Medium' },
        { name: 'high', value: 'High' }
      ]
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
})
