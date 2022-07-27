const
  { Command } = require('reconlx'),
  { Octokit } = require('@octokit/core'),
  { EmbedBuilder, Colors } = require('discord.js'),
  package = require('../../package.json')?.repository?.url
    .replace(/.*\.com\/|\.git/g, '').split('/');

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

  run: async (client, interaction) => {
    const octokit = new Octokit({ auth: client.keys.githubKey });

    try {
      await octokit.request(`POST /repos/${package[0]}/${package[1]}/issues`, {
        owner: package[0],
        repo: package[1],
        title: `${interaction.options.getString('title')} | ${interaction.options.getString('importance')} importance`,
        body:
          `<h3>Sent by ${interaction.user.tag} (${interaction.user.id}) with bot ${client.user.id}</h3>\n\n` +
          interaction.options.getString('suggestion'),
        assignees: [package[0]],
        labels: ['enhancement']
      })
    }
    catch (err) {
      interaction.editReply(`An error occurred.\n${err?.response.statusText}`);
      throw err;
    }

    let embed = new EmbedBuilder({
      title: 'Success',
      description:
        'Your suggestion has been sent.\n' +
        `[Suggestion link](https://github.com/${package[0]}/${package[1]}/issues?q=is%3Aopen+is%3Aissue+assignee%3A${package[0]}+author%3A${package[0]}+label%3Aenhancement)`,
      color: Colors.Green
    });

    interaction.editReply({ embeds: [embed] });

  }
})