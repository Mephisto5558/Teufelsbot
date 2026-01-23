/** @import { errorHandler } from '.' */

const
  {
    ActionRowBuilder, AttachmentBuilder, ButtonBuilder, ButtonStyle,
    Colors, CommandInteraction, ComponentType, EmbedBuilder, Message,
    MessageComponentInteraction, ModalSubmitInteraction, codeBlock, hyperlink, inlineCode
  } = require('discord.js'),
  fetch = require('node-fetch').default,
  { JSON_SPACES, commonHeaders } = require('./constants'),
  { msInSecond, secsInMinute } = require('./timeFormatter'),
  DiscordAPIErrorCodes = require('./DiscordAPIErrorCodes.json'),

  cwd = process.cwd();

/** @type {errorHandler} */
/* eslint-disable-next-line unicorn/no-useless-undefined, @typescript-eslint/no-useless-default-assignment
  -- lang is optional and has no default value. */
module.exports = async function errorHandler(err, context = [this], lang = undefined) {
  const

    /** @type {Record<string, unknown>} */
    contextData = (!Array.isArray(context) && context !== undefined ? [context] : context).reduce((/** @type {Record<string, unknown>} */ acc, e) => {
      acc[e?.constructor.name ?? Date.now().toString()] = e; // `Date.now` to prevent overwriting on multiple `undefined`
      return acc;
    }, {}),
    seen = new Set(),

    /** @type {Message | CommandInteraction | (MessageComponentInteraction | ModalSubmitInteraction) & { commandName: void } | undefined} */
    message = Object.values(contextData)
      .find(e => [Message, CommandInteraction, MessageComponentInteraction, ModalSubmitInteraction].some(type => e instanceof type));

  /**
   * @param {string} _
   * @param {bigint | Record<string, unknown> | undefined} v */
  function stringifyReplacer(_, v) {
    if (v != undefined && typeof v === 'object') {
      if (seen.has(v)) return '[Circular]';
      seen.add(v);
    }

    return v;
  }

  try {
    const msg = [
      ' [Error Handling] :: Uncaught Error' + (message?.commandName ? `\nCommand: ${message.commandName}\n` : '\n'),
      err.stack ?? JSON.stringify(err)
    ];

    log
      ._logToConsole({ file: 'error' }, ...msg, 'Additional Context: See error.log')
      ._logToFile({ file: 'error' }, ...msg, `Additional Context:\n${JSON.stringify(contextData, stringifyReplacer)}`);
  }
  catch (err2) {
    log.error(
      ' [Error Handling] :: Uncaught Error' + (message?.commandName ? `\nCommand: ${message.commandName}\n` : '\n'),
      err.stack ?? JSON.stringify(err),
      '\nCould not log additional context due to error', err2.stack ?? JSON.stringify(err2)
    );
  }

  if (!message || !lang) return;

  lang.config.backupPaths[0] = 'others.errorHandler';

  const
    { aliasOf } = this.slashCommands.get(message.commandName) ?? this.prefixCommands.get(message.commandName) ?? {},
    embed = new EmbedBuilder({
      title: lang('embedTitle'),
      description: lang('embedDescription', inlineCode(aliasOf
        ? this.slashCommands.get(aliasOf)?.name ?? this.prefixCommands.get(aliasOf)?.name
        : message.commandName ?? lang('global.unknown'))),
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

    /* eslint-disable-next-line @typescript-eslint/strict-void-return -- this cannot be cleanly resolved. */
    .on('collect', async button => {
      await button.deferUpdate();

      try {
        if (!(github.userName && github.repoName)) throw new Error('Missing GitHub username or repo name config');

        const
          title = `${err.name}: "${err.message}" in ${message.inGuild() ? '' : 'DM '}`
            + (message.commandName ? `command "${message.commandName}"` : ''),
          issues = await fetch(`https://api.github.com/repos/${github.userName}/${github.repoName}/issues`, {
            method: 'GET',
            headers: {
              ...commonHeaders(this),
              Authorization: `Bearer ${process.env.githubKey}`
            }
          }),

          /** @type {{ title: string, state: 'open' | 'closed' }[]} */
          issuesJson = await issues.json();

        if (!issues.ok) throw new Error(JSON.stringify(issuesJson));

        if (issuesJson.some(e => e.title == title && e.state == 'open')) {
          embed.data.description = lang('alreadyReported', hyperlink(lang('link'), issuesJson[0].html_url));
          return void msg.edit({ embeds: [embed], components: [] });
        }

        const
          res = await fetch(`https://api.github.com/repos/${github.userName}/${github.repoName}/issues`, {
            method: 'POST',
            headers: {
              ...commonHeaders(this, true),
              Authorization: `Bearer ${process.env.githubKey}`
            },
            body: JSON.stringify({
              title, labels: ['bug'],
              body: `<h3>Reported by ${button.user.tag} (${button.user.id}) with bot ${button.client.user.id}</h3>\n\n`
                + err.stack.replaceAll(cwd, '[cwd]')
            })
          }),

          /** @type {{ html_url: string }} */
          json = await res.json();

        if (!res.ok) throw new Error(JSON.stringify(json));

        const files = Object.entries(contextData).map(([k, v]) => new AttachmentBuilder(
          Buffer.from(JSON.stringify(v, stringifyReplacer, JSON_SPACES)),
          { name: `${k.toLowerCase()}.json` }
        ));

        for (const devId of devIds) {
          try { await this.users.send(devId, { content: json.html_url, files }); }
          catch (err) {
            if (err.code == DiscordAPIErrorCodes.UnknownUser) {
              log.error(`Unknown Dev ID "${devId}". Removing from loaded config.`);
              devIds.delete(devId);
            }
            else if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser)
              log.error(`Failed to send error report to dev ${devId}:`, err);
          }
        }

        return void msg.edit({
          /* eslint-disable-next-line unicorn/no-null -- `null` must be used here, as `undefined` is interpreted as 'Keep current data' */
          embeds: [embed.setFooter(null).setDescription(lang('reportSuccess', hyperlink(lang('link'), json.html_url)))],
          components: []
        });
      }
      catch (err) {
        log.error('Failed to report an error:', err.stack);

        msg.edit({ components: [] }).catch(() => { /* empty */ });

        return message.customReply(lang('reportFail', codeBlock(err?.message ?? 'unknown error')));
      }
    })
    .on('end', collected => {
      if (collected.size) return;

      component.components[0].data.disabled = true;
      return void msg.edit({ embeds: [embed], components: [component] });
    });
};