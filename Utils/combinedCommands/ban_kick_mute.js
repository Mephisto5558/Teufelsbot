const
  { EmbedBuilder, Colors, ActionRowBuilder, UserSelectMenuBuilder, ComponentType, PermissionFlagsBits } = require('discord.js'),
  { getMilliseconds } = require('better-ms'),
  checkTargetManageable = require('../checkTargetManageable.js'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json');

/** @type {command<'slash', true, true>['run']}*/
/* eslint-disable-next-line camelcase -- This casing is used to better display the commandNames. */
module.exports = async function ban_kick_mute(lang) {
  if (this.commandName == 'timeout') this.commandName = 'mute';
  if (!['ban', 'kick', 'mute'].includes(this.commandName)) throw new Error(`"${this.commandName}" is not an accepted commandName.`);

  const resEmbed = new EmbedBuilder({ title: lang('infoEmbedTitle'), color: Colors.Red });

  let
    noMsg, muteDurationMs,

    /** @type {number?}*/
    muteDuration = this.options.getString('duration'),
    reason = this.options.getString('reason', true);

  if (muteDuration) {
    muteDuration = getMilliseconds(muteDuration)?.limit?.({ min: 6e4, max: 2.419e9 });
    if (!muteDuration || typeof muteDuration == 'string') return this.editReply({ embeds: [resEmbed.setDescription(lang('invalidDuration'))] });

    muteDurationMs = muteDuration + Date.now();
    muteDuration = Math.round(muteDurationMs / 1000);
  }

  const

    /** @type {import('discord.js').GuildMember}*/
    target = this.options.getMember('target'),
    infoEmbedDescription = lang('infoEmbedDescription', { mod: this.user.tag, muteDuration, reason }),
    userEmbed = new EmbedBuilder({
      title: lang('infoEmbedTitle'),
      description: lang('dmEmbedDescription', { guild: this.guild.name, mod: this.user.tag, muteDuration, reason }),
      color: Colors.Red
    });

  resEmbed.data.description = infoEmbedDescription;

  reason += ` | ${lang('global.modReason', { command: this.commandName, user: this.user.tag })}`;

  if (target) {
    if (target.id == this.client.user.id) return this.editReply('1984');

    let err = checkTargetManageable.call(this, target);
    if (!err && target.permissions.has(PermissionFlagsBits.Administrator)) err = 'cantPunishAdmin';
    if (err) {
      resEmbed.data.description += lang('error', { err: lang(err), user: target.user?.tag ?? target.id });
      return this.editReply({ embeds: [resEmbed] });
    }

    try { await target.send({ embeds: [userEmbed] }); }
    catch (err) {
      if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
      noMsg = true;
    }

    if (this.commandName == 'kick') await target.kick(reason);
    else if (this.commandName == 'ban') await target.ban({ reason, deleteMessageSeconds: 86_400 * this.options.getNumber('delete_days_of_messages') });
    else await target.disableCommunicationUntil(muteDurationMs, reason);

    resEmbed.data.description += lang('success', { user: target.user.tag, muteDuration });
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
      .createMessageComponentCollector({ componentType: ComponentType.UserSelect, max: 1, time: 6e4, filter: i => i.user.id == this.user.id })
      .on('collect', async selectMenu => {
        await selectMenu.deferUpdate();

        for (const [, selectedMember] of selectMenu.members) {
          const err = checkTargetManageable.call(this, selectedMember, lang);

          if (err) {
            resEmbed.data.description += lang('error', { err: lang(err), user: selectedMember.user.tag });
            continue;
          }

          try { await selectedMember.send({ embeds: [userEmbed] }); }
          catch {
            if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;
            noMsg = true;
          }

          if (this.commandName == 'kick') await selectedMember.kick(reason);
          else if (this.commandName == 'ban') await selectedMember.ban({ reason, deleteMessageSeconds: 86_400 * this.options.getNumber('delete_days_of_messages') });
          else await selectedMember.disableCommunicationUntil(muteDurationMs, reason);

          resEmbed.data.description += lang('success', { user: selectedMember.user.tag, muteDuration });
          if (noMsg) resEmbed.data.description += lang('noDM');
        }

        if (resEmbed.data.description == infoEmbedDescription) resEmbed.data.description += lang('noneFound');

        await this.editReply({ embeds: [resEmbed], components: [] });

        collector.stop();
      })
      .on('end', collected => {
        if (collected.size) return;

        resEmbed.data.description = lang('timedOut');
        selectComponent.components[0].data.disabled = true;
        selectComponent.components[0].data.placeholder = lang('timedOut');

        return this.editReply({ embeds: [resEmbed], components: [selectComponent] });
      });
};