const
  { EmbedBuilder, Colors, PermissionFlagsBits } = require('discord.js'),
  { getMilliseconds } = require('better-ms'),
  { timeValidator } = require('../../Utils');

module.exports = {
  name: 'mute',
  aliases: { slash: ['timeout'] },
  permissions: { client: ['MuteMembers'], user: ['MuteMembers'] },
  cooldowns: { user: 100 },
  slashCommand: true,
  prefixCommand: false,beta:true,
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

  /**@this GuildInteraction @param {lang}lang*/
  run: async function (lang) {
    const
      target = this.options.getMember('target'),
      reason = this.options.getString('reason'),
      duration = getMilliseconds(this.options.getString('duration'))?.limit?.({ min: 6e4, max: 2419e5 }),
      date = new Date();

    let noMsg;

    if (!target) return this.editReply(lang('notFound'));
    if (target.id == this.member.id) return this.editReply(lang('cantMuteSelf'));
    if (target.roles.highest.position - this.member.roles.highest.position >= 0 && this.guild.ownerId != this.user.id)
      return this.editReply(lang('global.noPermUser'));
    if (target.permissions.has(PermissionFlagsBits.Administrator)) return this.editReply(lang('targetIsAdmin'));
    if (!target.moderatable) return this.editReply(lang('global.noPermBot'));
    if (!duration || typeof duration == 'string') return this.editReply(lang('invalidDuration'));

    date.setTime(date.getTime() + duration);

    try { await target.disableCommunicationUntil(date.getTime(), `${reason} | ${lang('global.modReason', { command: this.commandName, user: this.user.username })}`); }
    catch (err) { return this.editReply(lang('error', err.message)); }

    const embed = new EmbedBuilder({
      title: lang('dmEmbedTitle'),
      description: lang('dmEmbedDescription', {
        guild: this.guild.name, mod: this.user.displayName, reason,
        time: Math.round(target.communicationDisabledUntilTimestamp / 1000)
      }),
      color: Colors.Red
    });

    try { await target.send({ embeds: [embed] }); }
    catch { noMsg = true; }

    embed.data.title = lang('infoEmbedTitle');
    embed.data.description = lang('infoEmbedDescription', { user: target.user.displayName, reason, time: Math.round(target.communicationDisabledUntilTimestamp / 1000) });
    if (noMsg) embed.data.description += lang('noDM');

    return this.editReply({ embeds: [embed] });
  }
};
