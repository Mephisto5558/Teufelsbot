const
  { EmbedBuilder, Colors, inlineCode } = require('discord.js'),
  { hasPerm, createProxy } = require('./serverbackup_utils.js'),
  DiscordAPIErrorCodes = require('../DiscordAPIErrorCodes.json');

/** @type {import('.').serverbackup} */
module.exports = async function serverbackup(lang, _mode, id, option, clearGuildBeforeRestore) {
  lang.config.backupPaths.push('commands.administration.serverbackup.load');

  for (const component of this.message.components[0].components) component.data.disabled = true;
  await this.update({ components: this.message.components });

  const embed = EmbedBuilder.from(this.message.embeds[0]);

  if (option == 'cancel') return this.message.edit({ embeds: [embed.setDescription(lang('cancelled'))] });
  if (!this.client.backupSystem.get(id)) return this.message.edit({ embeds: [embed.setDescription(lang('noneFound'))] });
  if (!hasPerm.call(this, this.client.backupSystem.get(id))) return this.message.edit({ embeds: [embed.setDescription(lang('noPerm'))] });

  embed.data.color = Colors.White;
  let msg;
  try { msg = await this.member.send({ embeds: [embed.setDescription(lang('loadingEmbedDescription'))] }); }
  catch (err) {
    if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;

    return this.message.edit({ embeds: [embed.setColor(Colors.Red).setDescription(lang('enableDMs'))] });
  }

  const statusObj = createProxy.call(this, embed, lang, getEmoji('loading'));
  try {
    const backup = await this.client.backupSystem.load(id, this.guild, {
      statusObj, reason: lang('global.modReason', { command: `${this.customId.split('.')[0]} load`, user: this.user.tag }),
      clearGuildBeforeRestore: clearGuildBeforeRestore == 'true'
    });

    return msg.edit({ embeds: [embed.setDescription(lang('success', inlineCode(backup.id)))] });
  }
  catch (err) {
    void msg.edit({ embeds: [embed.setDescription(lang('error'))] });
    return log.error('An error occurred while trying to load a backup:', err);
  }
};