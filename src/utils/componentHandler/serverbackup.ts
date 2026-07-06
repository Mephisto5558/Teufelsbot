import { ButtonComponent, Colors, DiscordAPIError, EmbedBuilder, inlineCode } from 'discord.js';
import { createProxy, hasPerm } from './serverbackup_utils.ts';
import DiscordAPIErrorCodes from '../DiscordAPIErrorCodes.json' with { type: 'json' };
import type { GuildButtonInteraction, Response } from './index.ts';

export default async function serverbackup<
  MODE extends 'load', BACKUP_ID extends keyof Database['backups'], OPTION extends 'start' | 'cancel', CLEAR_GUILD_BEFORE_RESTORE extends `${boolean}`
>(
  this: GuildButtonInteraction<`serverbackup.${MODE}.${BACKUP_ID}.${OPTION}.${CLEAR_GUILD_BEFORE_RESTORE}`>,
  lang: lang, mode: MODE, backupId: BACKUP_ID, option: OPTION, clearGuildBeforeRestore: CLEAR_GUILD_BEFORE_RESTORE
): Promise<Response<true>> {
  lang.config.backupPaths.push('commands.administration.serverbackup.load');

  if (!(
    this.message.components[0] && 'components' in this.message.components[0]
    && this.message.components[0].components[0] instanceof ButtonComponent
  )) throw new Error('Unexpected components'); // typeguard

  for (const component of this.message.components[0].components) component.data.disabled = true;
  await this.update({ components: this.message.components });

  const embed = EmbedBuilder.from(this.message.embeds[0]);

  if (option == 'cancel') return this.message.edit({ embeds: [embed.setDescription(lang('cancelled'))] });
  if (!this.client.backupSystem.get(backupId)) return this.message.edit({ embeds: [embed.setDescription(lang('noneFound'))] });
  if (!hasPerm.call(this, this.client.backupSystem.get(backupId))) return this.message.edit({ embeds: [embed.setDescription(lang('noPerm'))] });

  embed.data.color = Colors.White;
  let msg;
  try { msg = await this.member.send({ embeds: [embed.setDescription(lang('loadingEmbedDescription'))] }); }
  catch (err) {
    if (!(err instanceof DiscordAPIError) || err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;

    return this.message.edit({ embeds: [embed.setColor(Colors.Red).setDescription(lang('enableDMs'))] });
  }

  const statusObj = createProxy.call(this, embed, lang, this.client.application.getEmoji('loading'));
  try {
    const backup = await this.client.backupSystem.load(backupId, this.guild, {
      statusObj, reason: lang('global.modReason', { command: `${this.customId.split('.', 1)[0]} load`, user: this.user.tag }),
      clearGuildBeforeRestore: clearGuildBeforeRestore == 'true'
    });

    return void msg.edit({ embeds: [embed.setDescription(lang('success', inlineCode(backup.backupId)))] });
  }
  catch (err) {
    void msg.edit({ embeds: [embed.setDescription(lang('error'))] });
    return log.error('An error occurred while trying to load a backup:', err);
  }
}