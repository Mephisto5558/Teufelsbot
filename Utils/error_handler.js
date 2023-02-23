const
  fetch = require('node-fetch').default,
  { EmbedBuilder, ActionRowBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors } = require('discord.js'),
  { Github } = require('../config.json');

module.exports = async function errorHandler(err, message, lang) {
  this.error ??= console.error;

  this.error(' [Error Handling] :: Uncaught Error');
  this.error(err.stack);

  if (!message) return;

  const
    embed = new EmbedBuilder({
      title: lang('events.errorHandler.embedTitle'),
      description: lang('events.errorHandler.embedDescription', { name: err.name, command: message.commandName }),
      color: Colors.DarkRed
    }),
    comp = new ActionRowBuilder({
      components: [new ButtonBuilder({
        customId: 'reportError',
        label: lang('events.errorHandler.reportButton') + (this.botType == 'dev' ? lang('events.errorHandler.reportButtonDisabled') : ''),
        style: ButtonStyle.Danger,
        disabled: this.botType == 'dev'
      })]
    }),
    msg = await message.customReply({ embeds: [embed], components: [comp] });

  if (this.botType == 'dev') return;

  const collector = msg.createMessageComponentCollector({
    filter: i => i.customId == 'reportError',
    max: 1, componentType: ComponentType.Button, time: 6e4
  });

  collector
    .on('collect', async button => {
      await button.deferUpdate();
      collector.stop();

      const title = `${err.name}: "${err.message}" in command "${message.commandName}"`;

      try {
        const res = await fetch(`https://api.github.com/repos/${Github.UserName}/${Github.RepoName}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `Token ${this.keys.githubKey}`,
            'User-Agent': `Bot ${Github.Repo}`
          },
          body: JSON.stringify({
            title,
            body: `<h3>Reported by ${button.user.tag} (${button.user.id}) with bot ${button.client.user.id}</h3>\n\n${err.stack}`,
            labels: ['bug']
          })
        });

        if (!res.ok) throw new Error(await res.json());

        embed.data.description = lang('events.errorHandler.reportSuccess', encodeURI(`${Github.Repo}/issues?q=is:open+is:issue+${title} in:title`));
        return msg.edit({ embeds: [embed], components: [] });
      }
      catch (err) {
        this.error(err.stack);
        return message.customReply(lang('events.errorHandler.reportFail', err?.message || 'unknown error'));
      }
    });

  collector.on('end', collected => {
    if (collected.size) return;

    comp.components[0].data.disabled = true;
    return msg.edit({ embeds: [embed], components: [comp] });
  });
};