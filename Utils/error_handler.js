const
  fetch = require('node-fetch').default,
  { EmbedBuilder, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors } = require('discord.js'),
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
      footer: { text: lang('events.errorHandler.embedFooterText') },
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

      try {
        const res = await fetch(`https://api.github.com/repos/${Github.UserName}/${Github.RepoName}/issues`, {
          method: 'POST',
          headers: {
            Authorization: `Token ${this.keys.githubKey}`,
            'User-Agent': `Bot ${Github.Repo}`
          },
          body: JSON.stringify({
            title: `${err.name}: "${err.message}" in command "${message.commandName}"`,
            body: `<h3>Reported by ${button.user.tag} (${button.user.id}) with bot ${button.client.user.id}</h3>\n\n${err.stack}`,
            labels: ['bug']
          })
        });
        const json = await res.json();

        if (!res.ok) throw new Error(json);

        const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify({ ...message }, (_, v) => typeof v == 'bigint' ? v.toString() : v, 2)), { name: 'data.json' });
        try { (this.application.owner.owner || this.application.owner).send({ content: json.html_url, files: [attachment] }); } catch { }

        return msg.edit({ embeds: [embed.setFooter(null).setDescription(lang('events.errorHandler.reportSuccess', json.html_url))], components: [] });
      }
      catch (err) {
        this.error(err.stack);
        return message.customReply(lang('events.errorHandler.reportFail', err?.message || 'unknown error'));
      }
    })
    .on('end', collected => {
      if (collected.size) return;

      comp.components[0].data.disabled = true;
      return msg.edit({ embeds: [embed], components: [comp] });
    });
};