const { EmbedBuilder, Colors } = require('discord.js');

module.exports = async function bankick(lang) {
  if (!['ban', 'kick'].includes(this.commandName)) throw new Error(`"${this.commandName}" is not an accepted commandName.`);

  const
    targets = new Set([...this.options.getString('targets').replace(/[^0-9\s]/g, '').split(' ').filter(e => e?.length == 18)]),
    reason = this.options.getString('reason'),
    userEmbed = new EmbedBuilder({
      title: lang('infoEmbedTitle'),
      description: lang('dmEmbedDescription', { guild: this.guild.name, mod: this.user.tag, reason }),
      color: Colors.Red
    }),
    resEmbed = new EmbedBuilder({
      title: lang('infoEmbedTitle'),
      description: lang('infoEmbedDescription', { mod: this.user.tag, reason }),
      color: Colors.Red
    });

  for (const rawTarget of targets) {
    let target, err, noMsg;

    try { target = await this.guild.members.fetch(rawTarget); }
    catch { target = { id: rawTarget }; }

    if (target.id == this.member.id) err = lang('cantPunishSelf');
    else if (target.roles?.highest.comparePositionTo(this.member.roles.highest) > -1 && this.guild.ownerId != this.user.id) err = lang('global.noPermUser');
    else if (!target.manageable) err = lang('global.noPermBot');

    if (err) {
      resEmbed.data.description += lang('error', { err, user: target?.user?.tag ?? target.id });
      continue;
    }

    try { await target.send({ embeds: [userEmbed] }); }
    catch { noMsg = true; }

    await (this.commandName == 'kick' ? target.kick(reason) : this.guild.bans.create(target.id, { reason, deleteMessageSeconds: 86400 * this.options.getNumber('delete_days_of_messages') }));

    resEmbed.data.description += lang('success', target?.user?.tag ?? target.id);
    if (noMsg) resEmbed.data.description += lang('noDM');
  }

  if (resEmbed.data.description == lang('infoEmbedDescription', { mod: this.user.tag, reason })) resEmbed.data.description += lang('noneFound');

  return this.editReply({ embeds: [resEmbed] });
};