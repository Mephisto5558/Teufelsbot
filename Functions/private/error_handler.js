const
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors } = require('discord.js'),
  { Octokit } = require('@octokit/core'),
  { Github } = require('../../config.json');

module.exports = async function (err, message, lang) {
  if (!this.error) this.error = console.error;
  if (!message) {
    this.error(' [Error Handling] :: Uncaught Error');
    return this.error(err.stack);
  }

  const
    octokit = new Octokit({ auth: this.keys.githubKey }),
    embed = new EmbedBuilder({
      title: lang('events.errorHandler.embedTitle'),
      description: lang('events.errorHandler.embedDescription', { name: err.name, command: message.commandName }),
      color: Colors.DarkRed
    }),
    comp = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          customId: 'reportError',
          label: lang('events.errorHandler.reportButton') + (this.botType == 'dev' ? lang('events.errorHandler.reportButtonDisabled') : ''),
          style: ButtonStyle.Danger,
          disabled: this.botType == 'dev'
        })
      ]
    });

  if (err.name == 'DiscordAPIError') return message.customReply(lang('events.errorHandler.discordAPIError'));

  this.error(' [Error Handling] :: Uncaught Error');
  this.error(err.stack);

  const msg = await message.customReply({ embeds: [embed], components: [comp] });

  if (this.botType == 'dev') return;

  const collector = msg.createMessageComponentCollector({ filter: i => i.customId == 'reportError', max: 1, componentType: ComponentType.Button, time: 60000 });
  collector.on('collect', async button => {
    await button.deferUpdate();
    collector.stop();

    const title = `${err.name}: "${err.message}" in command "${message.commandName}"`;

    try {
      const issues = await octokit.request(`GET /repos/${Github.UserName}/${Github.RepoName}/issues`, {});

      if (issues.data.filter(e => e.title == title && e.state == 'open').length) {
        embed.data.description = lang('events.errorHandler.alreadyReported', issues.data[0].html_url);
        return msg.edit({ embeds: [embed], components: [comp] });
      }

      await octokit.request(`POST /repos/${Github.UserName}/${Github.RepoName}/issues`, {
        title: title,
        body:
          `<h3>Reported by ${button.user.tag} (${button.user.id}) with bot ${button.guild.members.me.id}</h3>\n\n` +
          err.stack,
        assignees: [Github.UserName],
        labels: ['bug']
      });

      embed.data.description = lang('events.errorHandler.reportSuccess', encodeURI(`${Github.Repo}/issues?q=is:open+is:issue+${title} in:title`));
      msg.edit({ embeds: [embed], components: [comp] });
    }
    catch (err) {
      message.customReply(lang('events.errorHandler.reportFail', err?.response.statusText || 'unknown error'));
      this.error(err.stack);
    }
  });

  collector.on('end', _ => {
    comp.components[0].setDisabled(true);
    msg.edit({ embeds: [embed], components: [comp] });
  });
};
