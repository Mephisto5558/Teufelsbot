const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors, Message } = require('discord.js'),
  { Octokit } = require('@octokit/core'),
  { Github } = require('../../config.json');

module.exports = async (err, { keys, functions } = {}, message) => {
  if (!message) {
    console.error(errorColor, ' [Error Handling] :: Uncaught Error');
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
        `Command: \`${message.commandName}\``,
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
    filter = i => i.member.id == message.user.id && i.customId == 'reportError';

  let msg;

  switch (err.name) {
    case 'DiscordAPIError':
      interaction.followUp('An Discord API Error occurred, please try again and message the dev if this keeps happening.');
      break;

    default:
      console.error(errorColor, ' [Error Handling] :: Uncaught Error');
      console.error(err);
      console.error('\n');

      msg = message instanceof Message ? await functions.reply({ embeds: [embed], components: [comp] }, message) : await interaction.followUp({ embeds: [embed], components: [comp] });
  }

  if (!msg) return;

  const collector = message.createMessageComponentCollector?.({ filter, max: 1, componentType: ComponentType.Button, time: 60000 }) || message.channel.createMessageComponentCollector({ filter, max: 1, componentType: ComponentType.Button, time: 60000 });
  collector.on('collect', async button => {
    await button.deferUpdate();
    collector.stop();

    try {
      const issues = await octokit.request(`GET /repos/${Github.UserName}/${Github.RepoName}/issues`, {});
      const title = `${err.name}: "${err.message}" in command "${message.commandName}"`;

      if (issues.data.filter(e => e.title == title && e.state == 'open').length) {
        embed.data.description = `This issue has already been reported. [Link](${issues.data[0].html_url})\nIt will be fixed soon.`;
        return msg.edit({ embeds: [embed], components: [comp] });
      }

      await octokit.request(`POST /repos/${Github.UserName}/${Github.RepoName}/issues`, {
        title: title,
        body:
          `<h3>Reported by ${message.user.tag} (${message.user.id}) with bot ${message.guild.members.me.id}</h3>\n\n` +
          err.stack,
        assignees: [Github.UserName],
        labels: ['bug']
      });

      embed.data.description = `Your issue has been reported. [Link](${Github.Repo}/issues?q=is%3Aopen+is%3Aissue+${title} in:title)`;
      msg.edit({ embeds: [embed], components: [comp] });
    }
    catch (err) {
      if (message instanceof Message) functions.reply(`An error occurred while trying to send your error report.\n${err?.response.statusText || ''}\nPlease message the dev directly.`, message);
      else message.followUp(`An error occurred while trying to send your error report.\n${err?.response.statusText || ''}\nPlease message the dev directly.`);
      console.error(err);
    }
  });

  collector.on('end', _ => {
    comp.components[0].setDisabled(true);
    msg.edit({ embeds: [embed], components: [comp] });
  });
}
