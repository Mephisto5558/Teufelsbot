const
  { EmbedBuilder, Colors, PermissionFlagsBits } = require('discord.js'),
  { getMilliseconds } = require('better-ms'),
  { timeValidator, checkTargetManageable } = require('../../Utils');

/**@type {command}*/
module.exports = {
  name: 'mute',
  aliases: { prefix: ['timeout'], slash: ['timeout'] },
  permissions: { client: ['MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { user: 100 },
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'target',
      type: 'User',
      required: true,
    },
    {
      name: 'reason',
      type: 'String',
      required: true
    },
    {
      name: 'duration',
      type: 'String',
      required: true,
      autocompleteOptions: function () { return timeValidator(this.focused.value); },
      strictAutocomplete: true
    }
  ],

  /**@this GuildInteraction*/
  run: async function (lang) {
    const
      target = this.options.getMember('target'),
      reason = this.options.getString('reason'),
      duration = getMilliseconds(this.options.getString('duration'))?.limit?.({ min: 6e4, max: 2419e5 }),
      date = new Date();

    let noMsg;

    if (target.id == this.client.user.id) return this.editReply('1984');

    const err = checkTargetManageable.call(this, target);
    if (err) return this.editReply(lang(err));
    if (target.permissions.has(PermissionFlagsBits.Administrator)) return this.editReply(lang('targetIsAdmin'));
    if (!duration || typeof duration == 'string') return this.editReply(lang('invalidDuration'));

    date.setTime(date.getTime() + duration);

    try { await target.disableCommunicationUntil(date.getTime(), `${reason} | ${lang('global.modReason', { command: this.commandName, user: this.user.tag })}`); }
    catch (err) { return this.editReply(lang('error', err.message)); }

    const embed = new EmbedBuilder({
      title: lang('dmEmbedTitle'),
      description: lang('dmEmbedDescription', {
        guild: this.guild.name, mod: this.user.tag, reason,
        time: Math.round(target.communicationDisabledUntilTimestamp / 1000)
      }),
      color: Colors.Red
    });

    try { await target.send({ embeds: [embed] }); }
    catch { noMsg = true; }

    embed.data.title = lang('infoEmbedTitle');
    embed.data.description = lang('infoEmbedDescription', { user: target.user.tag, reason, time: Math.round(target.communicationDisabledUntilTimestamp / 1000) });
    if (noMsg) embed.data.description += lang('noDM');

    return this.editReply({ embeds: [embed] });
  }
};
