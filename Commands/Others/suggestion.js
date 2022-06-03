const { Command } = require('reconlx');
const { Octokit } = require("@octokit/core");
const { MessageEmbed } = require('discord.js');
const package = require('../../package.json')?.repository?.url
  .replace(/.*\.com\/|\.git/g, '').split('/');

module.exports = new Command({
  name: 'suggest',
  alias: [],
  description: 'Suggest a feature for the bot on Github.',
  permissions: { client: [], user: [] },
  cooldowns: { global: 0, user: 0 },
  category: 'Others',
  slashCommand: true,
  prefixCommand: true,
  options: [
    {
      name: 'title',
      description: 'the title of your suggestion',
      type: 'STRING',
      required: true
    },
    {
      name: 'suggestion',
      description: 'your suggestion. Gets send to github.',
      type: 'STRING',
      required: true
    },
    {
      name: 'importance',
      description: 'how important you think your suggestion is',
      type: 'STRING',
      required: true,
      choices: [
        { name: 'low', value: 'Low' },
        { name: 'medium', value: 'Medium' },
        { name: 'high', value: 'High' }
      ]
    }
  ],

  run: async (client, _, interaction) => {

    const octokit = new Octokit({ auth: client.keys.githubKey });

    await octokit.request(`POST /repos/${package[0]}/${package[1]}/issues`, {
      owner: package[0],
      repo: package[1],
      title: `${interaction.options.getString('title')} | ${interaction.options.getString('importance')} importance`,
      body:
        `<h3>Sent from ${interaction.user.tag} (${interaction.user.id}) with bot ${client.user.id}\n\n</h3>` +
        interaction.options.getString('suggestion'),
      assignees: [package[0]],
      labels: ['enhancement']
    })
      .then(_ => {
        let embed = new MessageEmbed()
          .setTitle('Success')
          .setDescription('Your suggestion has been sent.\n' +
            '[Link](https://github.com/Mephisto5558/Teufelswerk-Bot/issues?q=is%3Aopen+is%3Aissue+author%3AMephisto5558+assignee%3AMephisto5558)'
          );

        interaction.editReply({ embeds: [embed] })
      })
      .catch(err => {
        console.error(err);
        interaction.editReply(`An error occurred.\n${res?.response.statusText}`)
      });

  }
})