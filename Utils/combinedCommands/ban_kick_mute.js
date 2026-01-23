/** @import { ban_kick_mute } from '.' */

const
  {
    ActionRowBuilder, Colors, ComponentType, EmbedBuilder, PermissionFlagsBits,
    TimestampStyles, UserSelectMenuBuilder, bold, inlineCode
  } = require('discord.js'),
  { getMilliseconds } = require('better-ms'),
  checkTargetManageable = require('../checkTargetManageable'),
  { daysInMonthMin, secsInDay, timestamp } = require('../timeFormatter'),
  { dayToMs, minToMs } = require('../toMs'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json');

/** @type {ban_kick_mute} */
/* eslint-disable-next-line camelcase -- This casing is used to better display the commandNames. */
module.exports = async function ban_kick_mute(lang) {
  if (this.commandName == 'timeout') this.commandName = 'mute';
  if (!['ban', 'kick', 'mute'].includes(this.commandName)) throw new Error(`"${this.commandName}" is not an accepted commandName.`);

  /** @type {EmbedBuilder & { data: { description: string } }} */
  const resEmbed = new EmbedBuilder({ title: lang('infoEmbedTitle'), color: Colors.Red });

  let
    noMsg = false,
    /** @type {number | undefined} */ muteDurationMs,
    /** @type {string | undefined} */ muteDurationRelative,
    muteDuration = this.options.getString('duration'),
    reason = this.options.getString('reason', true);

  if (muteDuration) {
    muteDurationMs = getMilliseconds(muteDuration)?.limit({ min: minToMs(1), max: dayToMs(daysInMonthMin) });
    if (!muteDurationMs || typeof muteDurationMs == 'string') return this.editReply({ embeds: [resEmbed.setDescription(lang('invalidDuration'))] });

    muteDurationMs += Date.now();
    muteDuration = timestamp(muteDurationMs);
    muteDurationRelative = timestamp(muteDurationMs, TimestampStyles.RelativeTime);
  }

  const
    target = this.options.getMember('target', true),
    infoEmbedDescription = `${lang('infoEmbedDescription', { mod: this.user.tag, muteDuration, muteDurationRelative, reason })}\n\n`,
    userEmbed = new EmbedBuilder({
      title: lang('infoEmbedTitle'),
      description: lang('dmEmbedDescription', { guild: inlineCode(this.guild.name), mod: this.user.tag, muteDuration, muteDurationRelative, reason }),
      color: Colors.Red
    });

  resEmbed.data.description = infoEmbedDescription;

  reason += ` | ${lang('global.modReason', { command: this.commandName, user: this.user.tag })}`;

  if (target) {
    if (target.id == this.client.user.id) return this.editReply('1984');

    let err = checkTargetManageable.call(this, target);
    if (!err && target.permissions.has(PermissionFlagsBits.Administrator)) err = 'cantPunishAdmin';
    if (err) {
      resEmbed.data.description += `${lang('error', { err: lang(err), user: bold(target.user.tag) })}\n`;
      return this.editReply({ embeds: [resEmbed] });
    }

    try { await target.send({ embeds: [userEmbed] }); }
    catch (err) {
      if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
      noMsg = true;
    }

    if (this.commandName == 'kick') await target.kick(reason);
    else if (this.commandName == 'ban')
      await target.ban({ reason, deleteMessageSeconds: secsInDay * this.options.getNumber('delete_days_of_messages') });
    else await target.disableCommunicationUntil(muteDurationMs, reason);

    resEmbed.data.description += `${lang('success', { user: bold(target.user.tag), muteDuration, muteDurationRelative })}\n`;
    if (noMsg) resEmbed.data.description += lang('noDM');

    return this.editReply({ embeds: [resEmbed] });
  }

  const
    selectEmbed = new EmbedBuilder({
      title: lang('infoEmbedTitle'),
      description: lang('selectTargetEmbedDescription'),
      color: Colors.Orange
    }),
    selectComponent = new ActionRowBuilder({
      components: [new UserSelectMenuBuilder({
        minValues: 1,
        maxValues: 10,
        customId: 'selectTargetMenu'
      })]
    }),
    collector = (await this.editReply({ embeds: [selectEmbed], components: [selectComponent] }))
      .createMessageComponentCollector({ componentType: ComponentType.UserSelect, max: 1, time: minToMs(1), filter: i => i.user.id == this.user.id })

      /* eslint-disable-next-line @typescript-eslint/strict-void-return -- this cannot be cleanly resolved. */
      .on('collect', async selectMenu => {
        await selectMenu.deferUpdate();

        for (const [, selectedMember] of selectMenu.members) {
          const err = checkTargetManageable.call(this, selectedMember, lang);
          if (err) {
            resEmbed.data.description += `${lang('error', { err: lang(err), user: selectedMember.user.tag })}\n`;
            continue;
          }

          try { await selectedMember.send({ embeds: [userEmbed] }); }
          catch (err) {
            if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
            noMsg = true;
          }

          if (this.commandName == 'kick') await selectedMember.kick(reason);
          else if (this.commandName == 'ban')
            await selectedMember.ban({ reason, deleteMessageSeconds: secsInDay * this.options.getNumber('delete_days_of_messages') });
          else await selectedMember.disableCommunicationUntil(muteDurationMs, reason);

          resEmbed.data.description += `${lang('success', { user: bold(selectedMember.user.tag), muteDuration, muteDurationRelative })}\n`;
          if (noMsg) resEmbed.data.description += lang('noDM');
        }

        if (resEmbed.data.description == infoEmbedDescription) resEmbed.data.description += lang('noneFound');

        await this.editReply({ embeds: [resEmbed], components: [] });

        collector.stop();
      })
      .on('end', collected => {
        if (collected.size) return;

        resEmbed.data.description = lang('global.menuTimedOut');
        selectComponent.components[0].data.disabled = true;
        selectComponent.components[0].data.placeholder = lang('global.menuTimedOut');

        return void this.editReply({ embeds: [resEmbed], components: [selectComponent] });
      });
};