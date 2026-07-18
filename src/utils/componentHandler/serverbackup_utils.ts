import type { EmbedBuilder, Interaction } from 'discord.js';
import type { StatusObject } from '#utils/backupSystem.ts';
import type { GuildButtonInteraction } from './index.ts';

export function hasPerm(
  this: Interaction<'cached'>,
  backup?: Database['backups'][keyof Database['backups']]
): boolean {
  const creator = backup?.metadata[this.guild.db.serverbackup?.allowedToLoad ?? this.client.defaultSettings.serverbackup.allowedToLoad];
  return Array.isArray(creator) ? creator.includes(this.user.id) : creator == this.user.id;
}

export function createProxy(
  interaction: GuildInteraction | GuildButtonInteraction,
  embed: EmbedBuilder, lang: lang,
  langKeys: Record<string, string | number> | string | number
): StatusObject {
  return new Proxy<StatusObject>({ status: '' }, {
    set(obj, prop: 'status', value: string): true {
      obj[prop] = value;
      void interaction.editReply({ embeds: [embed.setDescription(lang(value, langKeys))] });
      return true;
    }
  });
}