const
  { EmbedBuilder, Colors, ActionRowBuilder, UserSelectMenuBuilder, ComponentType } = require('discord.js'),
  { getMilliseconds } = require('better-ms'),
  checkTargetManageable = require('../checkTargetManageable.js');

/**@this GuildInteraction @param {lang}lang*/
module.exports = async function ban_kick_mute(lang) {
  if (this.commandName == 'timeout') this.commandName = 'mute';
  if (!['ban', 'kick', 'mute'].includes(this.commandName)) throw new Error(`"${this.commandName}" is not an accepted commandName.`);

  let
    noMsg,
    /**@type {number?}*/
    muteDuration = this.options.getString('duration'),
    reason = this.options.getString('reason');

  if (muteDuration) {
    muteDuration = getMilliseconds(muteDuration)?.limit?.({ min: 6e4, max: 2419e5 });
    if (!muteDuration || typeof muteDuration == 'string') return this.editReply({ embeds: [resEmbed.setDescription(lang('invalidDuration'))] });

    muteDuration += Date.now();
  }

  const
    /**@type {import('discord.js').GuildMember}*/
    target = this.options.getMember('target'),
    infoEmbedDescription = lang('infoEmbedDescription', { mod: this.user.tag, reason }),
    userEmbed = new EmbedBuilder({
      title: lang('infoEmbedTitle'),
      description: lang('dmEmbedDescription', { guild: this.guild.name, mod: this.user.tag, muteDuration, reason }),
      color: Colors.Red
    }),
    resEmbed = new EmbedBuilder({
      title: lang('infoEmbedTitle'),
      description: infoEmbedDescription,
      color: Colors.Red
    });

  reason += ` | ${lang('global.modReason', { command: this.commandName, user: this.user.tag })}`;

  if (target) {
    if (target.id == this.client.user.id) return this.editReply('1984');

    const err = checkTargetManageable.call(this, target);
    if (err) {
      resEmbed.data.description += lang('error', { err: lang(err), user: target.user?.tag ?? target.id });
      return this.editReply({ embeds: [resEmbed] });
    }

    try { await target.send({ embeds: [userEmbed] }); }
    catch (err) {
      if (err.code != 50007) throw err; // "Cannot send messages to this user"
      noMsg = true;
    }

    if (this.commandName == 'kick') await target.kick(reason);
    else if (this.commandName == 'ban') await target.ban({ reason, deleteMessageSeconds: 86400 * this.options.getNumber('delete_days_of_messages') });
    else await target.disableCommunicationUntil(muteDuration, reason);

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
      .createMessageComponentCollector({ componentType: ComponentType.UserSelect, max: 1, time: 60000, filter: i => i.user.id == this.user.id })
      .on('collect', async selectMenu => {
        await selectMenu.deferUpdate();

        for (const [, target] of selectMenu.members) {
          const err = checkTargetManageable.call(this, target, lang);

          if (err) {
            resEmbed.data.description += lang('error', { err: lang(err), user: target.user.tag });
            continue;
          }

          try { await target.send({ embeds: [userEmbed] }); }
          catch {
            if (err.code != 50007) throw err; // "Cannot send messages to this user"
            noMsg = true;
          }

          if (this.commandName == 'kick') await target.kick(reason);
          else if (this.commandName == 'ban') await target.ban({ reason, deleteMessageSeconds: 86400 * this.options.getNumber('delete_days_of_messages') });
          else await target.disableCommunicationUntil(muteDuration, reason);

          resEmbed.data.description += lang('success', { user: target.user.tag, muteDuration });
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