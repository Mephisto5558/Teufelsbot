import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, inlineCode } from 'discord.js';
import { Command, CommandType, CooldownType, OptionType, Permission, PermissionType } from '@mephisto5558/command';
import { serverbackup_createProxy as createProxy, serverbackup_hasPerm as hasPerm } from '#utils/componentHandler';
import { timestamp } from '#utils/timeFormatter';

import type { backup } from '#types/db/backups';


const BYTES_IN_KILOBYTE = 1024;

function getData(backup: backup): {
  size: string;
  createdAt: ReturnType<typeof timestamp>;
  members: number;
  channels: number;
  roles: number;
  emojis: number;
  stickers: number;
} | undefined {
  if (!backup.__count__) return;

  const
    byteLength = Buffer.byteLength(JSON.stringify(backup)),
    size = byteLength > BYTES_IN_KILOBYTE ? `${(byteLength / BYTES_IN_KILOBYTE).toFixed(2)}KB` : `${byteLength}B`;


  return {
    size,
    createdAt: timestamp(backup.createdAt),
    members: backup.members?.length ?? 0,
    channels: (
      backup.channels.categories.length + backup.channels.others.length
      + backup.channels.categories.reduce((acc, e) => acc + e.children.length, 0)
    ) || 0,
    roles: backup.roles.length,
    emojis: backup.emojis.length,
    stickers: backup.stickers.length
  };
}

const backupMainFunctions = {
  create: async function createBackup(lang, embed): Promise<Message> {
    embed.data.color = Colors.White;

    const
      statusObj = createProxy(this, embed, lang, this.client.application.getEmoji('loading')!),
      backup = await this.client.backupSystem!.create(this.guild, {
        save: true, saveImages: true, backupMembers: true,
        metadata: [
          this.user.id, this.guild.ownerId, [this.user.id, this.guild.ownerId],
          this.guild.members.cache.filter(e => e.permissions.has(Permission.Administrator)).keys().toArray()
        ], statusObj
      });

    return this.editReply({
      embeds: [embed.setDescription(lang('success', { id: inlineCode(backup.id), cmd: this.client.commandManager.get(this.commandName)!.mention() }))]
    });
  },

  load: async function loadBackup(lang, embed, id): Promise<Message> {
    if (!this.client.backupSystem!.get(id)) return this.editReply({ embeds: [embed.setDescription(lang('noneFound'))] });
    if (!hasPerm.call(this, this.client.backupSystem!.get(id))) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });

    const component = new ActionRowBuilder({
      components: [
        new ButtonBuilder({
          label: lang('global.true'),
          customId: `${this.commandName}.${this.options.getSubcommand()}.${id}.start.${!this.options.getBoolean('no_clear')}`,
          style: ButtonStyle.Danger
        }),
        new ButtonBuilder({
          label: lang('global.false'),
          customId: `${this.commandName}.${this.options.getSubcommand()}.${id}.cancel`,
          style: ButtonStyle.Success
        })
      ]
    });

    return this.editReply({ embeds: [embed.setColor(Colors.DarkRed).setDescription(lang('overwriteWarningDescription'))], components: [component] });
  },

  delete: async function deleteBackup(lang, embed, id): Promise<Message> {
    if (this.user.id != this.guild.ownerId || !hasPerm.call(this, this.client.backupSystem!.get(id)))
      return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('noPerm'))] });

    await this.client.backupSystem!.remove(id);
    return this.editReply({ embeds: [embed.setDescription(lang('success'))] });
  },

  get: async function getBackup(lang, embed, id?: backup['id']): Promise<Message> {
    embed.setColor(Colors.White).setThumbnail(this.guild.iconURL());

    if (id) {
      const backup = this.client.backupSystem!.get(id);
      return this.editReply({
        embeds: [backup
          ? embed.setDescription(lang('oneEmbedDescription', { id: inlineCode(id), ...getData(backup) }))
          : embed.setColor(Colors.Red).setDescription(lang('oneNotFound'))]
      });
    }

    embed.data.fields = this.client.backupSystem!.list(this.guild.id)
      .sort((a, b) => Temporal.Instant.compare(b.createdAt, a.createdAt))
      .first(10)
      .map(e => ({ name: e.id, value: lang('infos', getData(e)) }));

    if (embed.data.fields.length) embed.data.footer = { text: lang('found', this.client.backupSystem!.list(this.guild.id).size) };
    return this.editReply({ embeds: [embed.setDescription(lang(embed.data.fields.length ? 'embedDescription' : 'noneFound'))] });
  }
} satisfies Record<string, (this: GuildInteraction, lang: lang, embed: EmbedBuilder, id: backup['id']) => Promise<Message>>;

export default new Command({
  types: [CommandType.Slash],
  permissions: { [PermissionType.Client]: [Permission.Administrator], [PermissionType.User]: [Permission.Administrator] },
  disabled: true,
  disabledReason: 'This command is still in development',
  options: [
    {
      name: 'create',
      type: OptionType.Subcommand,
      cooldowns: { [CooldownType.Guild]: '30min' }
    },
    {
      name: 'load',
      type: OptionType.Subcommand,
      cooldowns: { [CooldownType.Guild]: '5min' },
      options: [
        {
          name: 'id',
          type: OptionType.String,
          autocompleteOptions() { return this.client.backupSystem!.list().filter(hasPerm.bind(this)).keys(); }
        },
        { name: 'no_clear', type: OptionType.Boolean }
      ]
    },
    {
      name: 'get',
      type: OptionType.Subcommand,
      options: [{
        name: 'id',
        type: OptionType.String,
        autocompleteOptions() { return this.client.backupSystem!.list(this.guild.id).keys(); }
      }]
    },
    {
      name: 'delete',
      type: OptionType.Subcommand,
      options: [{
        name: 'id',
        type: OptionType.String,
        required: true,
        autocompleteOptions() { return this.client.backupSystem!.list(this.guild.id).keys(); }
      }]
    }
  ], beta: true,

  async run(lang) {
    const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

    lang.config.backupPaths!.push(`${lang.config.backupPaths![0]}.${this.options.getSubcommand()}`);
    return backupMainFunctions[this.options.getSubcommand(true)].call(this, lang, embed, this.options.getString('id'));
  }
});