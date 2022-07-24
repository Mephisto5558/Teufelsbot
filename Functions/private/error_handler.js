const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors } = require('discord.js'),
  { Octokit } = require('@octokit/core'),
  { red } = require('chalk').bold,
  package = require('../../package.json')?.repository?.url
    .replace(/.*\.com\/|\.git/g, '').split('/');

module.exports = async ({ keys }, interaction, err) => {
  if (!interaction) {
    console.error(red(' [Error Handling] :: Uncaught Error'));
    console.error(err);
    return console.error('\n');
  }
  const
    octokit = new Octokit({ auth: keys.githubKey }),
    embed = new EmbedBuilder({
      title: 'Whoooops',
      description:
        'A unexpected error occurred!\n\n' +
        `Error Type: \`${err.name}\`\n` +
        `Command: \`${interaction.commandName}\``,
      color: Colors.DarkRed
    }),
    comp = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: 'reportError',
          label: 'Report this Error',
          style: ButtonStyle.Danger
        })
      ]
    }),
    filter = i => i.member.id == interaction.member.id && i.customId == 'reportError';

  let msg;

  switch (err.name) {
    case 'DiscordAPIError':
      interaction.followUp('An Discord API Error occurred, please try again and message the dev if this keeps happening.');
      break;

    default:
      console.error(red(' [Error Handling] :: Uncaught Error'))
      console.error(err);
      console.error('\n');

      msg = await interaction.followUp({ embeds: [embed], components: [comp] });
  }

  if (!msg) return;

  const collector = interaction.channel.createMessageComponentCollector({ filter, max: 1, componentType: ComponentType.Button, time: 60000 });
  collector.on('collect', async button => {
    await button.deferUpdate();
    collector.stop();

    try {
      const issues = await octokit.request(`GET /repos/${package[0]}/${package[1]}/issues`, {});
      const title = `${err.name}: "${err.message}" in command "${interaction.commandName}"`;

      if (issues.data.filter(e => e.title == title && e.state == 'open').length) {
        embed.data.description = `This issue has already been reported. [Link](${issues.data[0].html_url})\nIt will be fixed soon.`;
        return msg.edit({ embeds: [embed], components: [comp] });
      }

      await octokit.request(`POST /repos/${package[0]}/${package[1]}/issues`, {
        title: title,
        body:
          `<h3>Reported by ${interaction.user.tag} (${interaction.user.id}) with bot ${interaction.guild.members.me.id}</h3>\n\n` +
          err.stack,
        assignees: [package[0]],
        labels: ['bug']
      });

      embed.data.description = `Your issue has been reported. [Link](https://github.com/${package[0]}/${package[1]}/issues?q=is%3Aopen+is%3Aissue+${title} in:title)`;
      msg.edit({ embeds: [embed], components: [comp] });
    }
    catch (err) {
      interaction.followUp(`An error occurred while trying to send your error report.\n${err?.response.statusText || ''}\nPlease message the dev directly.`);
      console.error(err);
    }
  });

  collector.on('end', _ => {
    comp.components[0].setDisabled(true);
    msg.edit({ embeds: [embed], components: [comp] });
  });
}