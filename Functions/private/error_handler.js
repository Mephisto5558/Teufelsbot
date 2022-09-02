const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors } = require('discord.js'),
  { Octokit } = require('@octokit/core'),
  { Github } = require('../../config.json');

module.exports = async (err, { keys, botType, error = console.error } = {}, message, lang) => {
  if (!message) {
    error(' [Error Handling] :: Uncaught Error');
    return error(err.stack);
  }

  const
    octokit = new Octokit({ auth: keys.githubKey }),
    embed = new EmbedBuilder({
      title: lang('events.errorHandler.embedTitle'),
      description: lang('events.errorHandler.embedDescription', { name: err.name, command: message.commandName }),
      color: Colors.DarkRed
    }),
    comp = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: 'reportError',
          label: lang('events.errorHandler.reportButton') + (botType == 'dev' ? lang('events.errorHandler.reportButtonDisabled') : ''),
          style: ButtonStyle.Danger,
          disabled: botType == 'dev'
        })
      ]
    });

  let msg;

  switch (err.name) {
    case 'DiscordAPIError':
      message.followUp(lang('events.errorHandler.discordAPIError'));
      break;

    default:
      error(' [Error Handling] :: Uncaught Error');
      error(err.stack);

      msg = await message.customReply({ embeds: [embed], components: [comp] });
  }

  if (!msg) return;

  const collector = message.createMessageComponentCollector?.({ filter: i => i.customId == 'reportError', max: 1, componentType: ComponentType.Button, time: 60000 }) || message.channel.createMessageComponentCollector({ filter: i => i.customId == 'reportError', max: 1, componentType: ComponentType.Button, time: 60000 });
  collector.on('collect', async button => {
    await button.deferUpdate();
    collector.stop();

    try {
      const issues = await octokit.request(`GET /repos/${Github.UserName}/${Github.RepoName}/issues`, {});
      const title = `${err.name}: "${err.message}" in command "${message.commandName}"`;

      if (issues.data.filter(e => e.title == title && e.state == 'open').length) {
        embed.data.description = lang('events.errorHandler.alreadyReported', issues.data[0].html_url);
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

      embed.data.description = lang('events.errorHandler.reportSuccess', encodeURI(`${Github.Repo}/issues?q=is:open+is:issue+${title} in:title`));
      msg.edit({ embeds: [embed], components: [comp] });
    }
    catch (err) {
      message.customReply(lang('events.errorHandler.reportFail', err?.response.statusText || 'unknown error'));
      error(err.stack);
    }
  });

  collector.on('end', _ => {
    comp.components[0].setDisabled(true);
    msg.edit({ embeds: [embed], components: [comp] });
  });
}
