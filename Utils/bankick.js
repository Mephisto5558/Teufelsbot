const
  { EmbedBuilder, Colors, ActionRowBuilder, UserSelectMenuBuilder, ComponentType } = require('discord.js'),
  checkTarget = require('./checkTargetBanPerm.js');

/**@this {import('discord.js').ChatInputCommandInteraction}*/
module.exports = async function bankick(lang) {
  if (!['ban', 'kick'].includes(this.commandName)) throw new Error(`"${this.commandName}" is not an accepted commandName.`);

  const
    target = this.options.getMember('target'),
    reason = this.options.getString('reason') + `, moderator ${this.user.tag}`,
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

  let noMsg;

  if (target) {
    const err = checkTarget.call(this, target, lang);
    if (err) {
      resEmbed.data.description += lang('error', { err: lang(err), user: target.user?.tag ?? target.id });
      return this.editReply(resEmbed);
    }

    try { await target.send({ embeds: [userEmbed] }); }
    catch { noMsg = true; }

    await (this.commandName == 'kick' ? target.kick(reason) : target.ban({ reason, deleteMessageSeconds: 86400 * this.options.getNumber('delete_days_of_messages') }));
    resEmbed.data.description += lang('success', target.user?.tag ?? target.id);
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
          const err = checkTarget.call(this, target, lang);

          if (err) {
            resEmbed.data.description += lang('error', { err: lang(err), user: target.user.tag });
            continue;
          }

          try { await target.send({ embeds: [userEmbed] }); }
          catch { noMsg = true; }

          await (this.commandName == 'kick' ? target.kick(reason) : target.ban({ reason, deleteMessageSeconds: 86400 * this.options.getNumber('delete_days_of_messages') }));

          resEmbed.data.description += lang('success', target.user.tag);
          if (noMsg) resEmbed.data.description += lang('noDM');
        }

        if (resEmbed.data.description == lang('infoEmbedDescription', { mod: this.user.tag, reason })) resEmbed.data.description += lang('noneFound');

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

  return collector;
};