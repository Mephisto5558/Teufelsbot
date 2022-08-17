const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors, Message } = require('discord.js'),
  { Octokit } = require('@octokit/core'),
  { Github } = require('../../config.json');

module.exports = async (err, { keys, functions, botType, error = console.error } = {}, message, lang) => {
  if (!message) {
    error(errorColor, ' [Error Handling] :: Uncaught Error');
    return error(err);
  }

  const
    octokit = new Octokit({ auth: keys.githubKey }),
    embed = new EmbedBuilder({
      title: lang('events.errorHandler.embedTitle'),
      description: lang('events.errorHandler.embedDescription', err.name, message.commandName),
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
    }),
    filter = i => i.member.id == message.user.id && i.customId == 'reportError';

  let msg;

  switch (err.name) {
    case 'DiscordAPIError':
      message.followUp(lang('events.errorHandler.discordAPIError'));
      break;

    default:
      error(errorColor, ' [Error Handling] :: Uncaught Error');
      error(err);

      msg = message instanceof Message ? await functions.reply({ embeds: [embed], components: [comp] }, message) : await message.followUp({ embeds: [embed], components: [comp] });
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

      embed.data.description = lang('events.errorHandler.reportSuccess', encodeURI(`${Github.Repo}/issues?q=is:open+is:issue+${title} in:title)`));
      msg.edit({ embeds: [embed], components: [comp] });
    }
    catch (err) {
      if (message instanceof Message) functions.reply(lang('events.errorHandler.reportFail', err?.response.statusText || 'unknown error'), message);
      else message.followUp(lang('events.errorHandler.reportFail', err?.response.statusText || 'unknown error'));
      error(err);
    }
  });

  collector.on('end', _ => {
    comp.components[0].setDisabled(true);
    msg.edit({ embeds: [embed], components: [comp] });
  });
}
