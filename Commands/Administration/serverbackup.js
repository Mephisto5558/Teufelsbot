/** @import { backupId } from '#types/db' */

const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, PermissionFlagsBits, inlineCode } = require('discord.js'),
  { Command, Permissions, commandTypes } = require('@mephisto5558/command'),
  { timeFormatter: { timestamp }, commandMention, toMs: { minToMs } } = require('#Utils'),
  { serverbackup_createProxy: createProxy, serverbackup_hasPerm: hasPerm } = require('#Utils/componentHandler'),

  BYTES_IN_KILOBYTE = 1024;

/** @param {Database['backups'][backupId]} backup */
function getData(backup) {
  if (backup.__count__) {
    return {
      createdAt: timestamp(backup.createdAt),
      size: (() => {
        const size = Buffer.byteLength(JSON.stringify(backup));
        return size > BYTES_IN_KILOBYTE ? `${(size / BYTES_IN_KILOBYTE).toFixed(2)}KB` : `${size}B`;
      })(),
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
}

/** @type {Record<string, (this: GuildInteraction, lang: lang, embed: EmbedBuilder, id?: backupId) => Promise<Message>>} */
const backupMainFunctions = {
  create: async function createBackup(lang, embed) {
    embed.data.color = Colors.White;

    const
      statusObj = createProxy(this, embed, lang, this.client.application.getEmoji('loading')),
      backup = await this.client.backupSystem.create(this.guild, {
        save: true, saveImages: true, backupMembers: true,
        metadata: [
          this.user.id, this.guild.ownerId, [this.user.id, this.guild.ownerId],
          [...this.guild.members.cache.filter(e => e.permissions.has(PermissionFlagsBits.Administrator)).keys()]
        ], statusObj
      });

    return this.editReply({
      embeds: [embed.setDescription(lang('success', { id: inlineCode(backup.id), cmd: commandMention(this.commandName, this.commandId) }))]
    });
  },

  load: async function loadBackup(lang, embed, id) {
    if (!this.client.backupSystem.get(id)) return this.editReply({ embeds: [embed.setDescription(lang('noneFound'))] });
    if (!hasPerm.call(this, this.client.backupSystem.get(id))) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });

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

  delete: async function deleteBackup(lang, embed, id) {
    if (this.user.id != this.guild.ownerId || !hasPerm.call(this, this.client.backupSystem.get(id)))
      return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('noPerm'))] });

    await this.client.backupSystem.remove(id);
    return this.editReply({ embeds: [embed.setDescription(lang('success'))] });
  },

  get: function getBackup(lang, embed, id) {
    embed.setColor(Colors.White).setThumbnail(this.guild.iconURL());

    if (id) {
      const backup = this.client.backupSystem.get(id);
      return void this.editReply({
        embeds: [backup
          ? embed.setDescription(lang('oneEmbedDescription', { id: inlineCode(id), ...getData(backup) }))
          : embed.setColor(Colors.Red).setDescription(lang('oneNotFound'))]
      });
    }

    embed.data.fields = this.client.backupSystem.list(this.guild.id)
      /* eslint-disable-next-line unicorn/no-array-sort -- false positive: discord.js Collection instead of Array */
      .sort((a, b) => b.createdAt - a.createdAt)
      .first(10)
      .map(e => ({ name: e.id, value: lang('infos', getData(e)) }));

    if (embed.data.fields.length) embed.data.footer = { text: lang('found', this.client.backupSystem.list(this.guild.id).size) };
    return void this.editReply({ embeds: [embed.setDescription(lang(embed.data.fields.length ? 'embedDescription' : 'noneFound'))] });
  }
};

module.exports = new Command({
  types: [commandTypes.slash],
  permissions: { client: [Permissions.Administrator], user: [Permissions.Administrator] },
  disabled: true,
  disabledReason: 'This command is still in development',
  options: [
    {
      name: 'create',
      type: 'Subcommand',
      cooldowns: { guild: minToMs(30) } /* eslint-disable-line @typescript-eslint/no-magic-numbers */
    },
    {
      name: 'load',
      type: 'Subcommand',
      cooldowns: { guild: minToMs(5) }, /* eslint-disable-line @typescript-eslint/no-magic-numbers */
      options: [
        {
          name: 'id',
          type: 'String',
          autocompleteOptions() {
            return [...this.client.backupSystem.list().filter(hasPerm.bind(this)).keys()];
          }
        },
        { name: 'no_clear', type: 'Boolean' }
      ]
    },
    {
      name: 'get',
      type: 'Subcommand',
      options: [{
        name: 'id',
        type: 'String',
        autocompleteOptions() { return [...this.client.backupSystem.list(this.guild.id).keys()]; }
      }]
    },
    {
      name: 'delete',
      type: 'Subcommand',
      options: [{
        name: 'id',
        type: 'String',
        required: true,
        autocompleteOptions() { return [...this.client.backupSystem.list(this.guild.id).keys()]; }
      }]
    }
  ], beta: true,

  async run(lang) {
    const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

    lang.config.backupPaths.push(`${lang.config.backupPaths[0]}.${this.options.getSubcommand()}`);
    return backupMainFunctions[this.options.getSubcommand()].call(this, lang, embed, this.options.getString('id'));
  }
});