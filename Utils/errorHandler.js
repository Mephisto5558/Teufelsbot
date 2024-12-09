const
  fetch = require('node-fetch').default,
  { EmbedBuilder, ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle, ComponentType, Colors, Message, BaseInteraction } = require('discord.js'),
  { msInSecond, secsInMinute } = require('./timeFormatter.js'),
  { JSON_SPACES } = require('./constants'),
  DiscordAPIErrorCodes = require('./DiscordAPIErrorCodes.json'),
  cwd = process.cwd();

/** @type {import('.').errorHandler} */
/* eslint-disable-next-line unicorn/no-useless-undefined -- lang is optional and doesn't have a default value. */
module.exports = async function errorHandler(err, context = [], lang = undefined) {
  const

    /** @type {Record<string, unknown>} */
    contextData = (!Array.isArray(context) && context !== undefined ? [context] : context).reduce((acc, e) => {
      acc[e?.constructor.name ?? Date.now().toString()] = e; // `Date.now` to prevent overwriting on multiple `undefined`
      return acc;
    }, {}),
    seen = new Set(),
    message = Object.values(contextData).find(e => e instanceof Message || e instanceof BaseInteraction);

  /**
   * @param {string}_
   * @param {bigint | Record<string, unknown> | undefined}v */
  function stringifyReplacer(_, v) {
    if (typeof v == 'bigint') return v.toString();
    if (v != undefined && typeof v === 'object') {
      if (seen.has(v)) return '[Circular]';
      seen.add(v);
    }

    return v;
  }

  log.error(
    ' [Error Handling] :: Uncaught Error' + (message?.commandName ? `\nCommand: ${message.commandName}\n` : '\n'),
    err.stack ?? JSON.stringify(err),
    contextData.__count__ ? `\nAdditional Context:\n${JSON.stringify(contextData, stringifyReplacer)}` : ''
  );

  if (!message || !lang) return;

  lang.__boundArgs__[0].backupPath = 'others.errorHandler';

  const
    { aliasOf } = this.slashCommands.get(message.commandName) ?? this.prefixCommands.get(message.commandName) ?? {},
    embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', { command: aliasOf ? this.slashCommands.get(aliasOf)?.name ?? this.prefixCommands.get(aliasOf)?.name : message.commandName }),
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

  const { github, devIds } = this.config;

  msg.createMessageComponentCollector({ max: 1, componentType: ComponentType.Button, time: msInSecond * secsInMinute })
    .on('collect', async button => {
      await button.deferUpdate();

      try {
        if (!(github.userName && github.repoName)) throw new Error('Missing GitHub username or repo name config');

        const
          headers = {
            Authorization: `Token ${this.keys.githubKey}`,
            'User-Agent': `Bot ${github.repo}`
          },
          title = `${err.name}: "${err.message}" in ${message.inGuild() ? '' : 'DM '}command "${message.commandName}"`,
          issues = await fetch(`https://api.github.com/repos/${github.userName}/${github.repoName}/issues`, {
            method: 'GET', headers
          }),

          /** @type {{ title: string, state: 'open' | 'closed' }[]} */
          issuesJson = await issues.json();

        if (!issues.ok) throw new Error(JSON.stringify(issuesJson));

        if (issuesJson.filter(e => e.title == title && e.state == 'open').length) {
          embed.data.description = lang('alreadyReported', issuesJson[0].html_url);
          return msg.edit({ embeds: [embed], components: [] });
        }

        const
          res = await fetch(`https://api.github.com/repos/${github.userName}/${github.repoName}/issues`, {
            headers, method: 'POST',
            body: JSON.stringify({
              title, body: `<h3>Reported by ${button.user.tag} (${button.user.id}) with bot ${button.client.user.id}</h3>\n\n${err.stack.replaceAll(cwd, '[cwd]')}`,
              labels: ['bug']
            })
          }),

          /** @type {{ html_url: string }} */
          json = await res.json();

        if (!res.ok) throw new Error(JSON.stringify(json));

        const files = Object.entries(contextData).map(([k, v]) => new AttachmentBuilder(Buffer.from(JSON.stringify(v, stringifyReplacer, JSON_SPACES)), { name: `${k.toLowerCase()}.json` }));

        for (const devId of devIds) {
          try { await (await this.users.fetch(devId)).send({ content: json.html_url, files }); }
          catch (err) {
            if (err.code == DiscordAPIErrorCodes.UnknownUser) log.error(`Unknown Dev ID "${devId}"`);
            else if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
          }
        }

        /* eslint-disable-next-line unicorn/no-null -- `null` must be used here, as `undefined` is interpreted as 'Keep current data' */
        return msg.edit({ embeds: [embed.setFooter(null).setDescription(lang('reportSuccess', json.html_url))], components: [] });
      }
      catch (err) {
        log.error('Failed to report an error:', err.stack);

        msg.edit({ components: [] }).catch(() => { /* empty */ });

        return message.customReply(lang('reportFail', err?.message ?? 'unknown error'));
      }
    })
    .on('end', collected => {
      if (collected.size) return;

      component.components[0].data.disabled = true;
      return msg.edit({ embeds: [embed], components: [component] });
    });
};