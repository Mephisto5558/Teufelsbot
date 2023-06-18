const
  fetch = require('node-fetch').default,
  { EmbedBuilder, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors } = require('discord.js'),
  { Github } = require('../config.json');

module.exports = async function errorHandler(err, message, lang) {
  log.error(' [Error Handling] :: Uncaught Error', err.stack);

  if (!message) return;

  lang.__boundArgs__[0].backupPath = 'events.errorHandler';

  const
    { aliasOf } = this.slashCommands.get(message.commandName) || this.prefixCommands.get(message.commandName) || {},
    embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { name: err.name, command: aliasOf ? this.slashCommands.get(aliasOf)?.name || this.prefixCommands.get(aliasOf)?.name : message.commandName }),
      footer: { text: lang('embedFooterText') },
      color: Colors.DarkRed
    }),
    component = new ActionRowBuilder({
      components: [new ButtonBuilder({
        customId: 'errorHandler.reportError',
        label: lang('reportButton') + (this.botType == 'dev' ? lang('reportButtonDisabled') : ''),
        style: ButtonStyle.Danger,
        disabled: this.botType == 'dev'
      })]
    }),
    msg = await message.customReply({ embeds: [embed], components: [component] });

  if (this.botType == 'dev') return;

  msg.createMessageComponentCollector({ max: 1, componentType: ComponentType.Button, time: 6e4 })
    .on('collect', async button => {
      await button.deferUpdate();

      try {
        const
          res = await fetch(`https://api.github.com/repos/${Github.UserName}/${Github.RepoName}/issues`, {
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
          }),
          json = await res.json();

        if (!res.ok) throw new Error(json);

        const attachment = new AttachmentBuilder(Buffer.from(JSON.stringify({ ...message }, (_, v) => typeof v == 'bigint' ? v.toString() : v, 2)), { name: 'data.json' });
        try { (this.application.owner.owner || this.application.owner).send({ content: json.html_url, files: [attachment] }); } catch { }

        return msg.edit({ embeds: [embed.setFooter(null).setDescription(lang('reportSuccess', json.html_url))], components: [] });
      }
      catch (err) {
        log.error(err.stack);
        return message.customReply(lang('reportFail', err?.message || 'unknown error'));
      }
    })
    .on('end', collected => {
      if (collected.size) return;

      component.components[0].data.disabled = true;
      return msg.edit({ embeds: [embed], components: [component] });
    });
};