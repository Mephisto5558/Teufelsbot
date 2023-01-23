//WIP
let size;
const
  { EmbedBuilder, Colors, ActionRowBuilder, TextInputStyle, PermissionFlagsBits, ButtonBuilder } = require('discord.js'),
  getData = backup => Object.keys(backup).length ? ({
    createdAt: Math.round(backup.createdTimestamp / 1000),
    size: (size = Buffer.byteLength(JSON.stringify(backup))) > 1024 ? `${(size / 1024).toFixed(2)}KB` : `${size}B`,
    members: backup.members?.length ?? 0,
    channels: (backup.channels.categories.length + backup.channels.others.length + backup.channels.categories.reduce((acc, e) => acc + e.children.length, 0)) ?? 0,
    roles: backup.roles?.length ?? 0,
    emojis: backup.emojis?.length ?? 0,
    stickers: backup.stickers?.length ?? 0
  }) : null;

function checkLoadPerm(backup) {
  const creator = backup?.metadata?.[this.guild.db.serverbackup?.allowedToLoad ?? this.guild.defaultSettings.serverbackup.allowedToLoad];
  return Array.isArray(creator) ? creator.includes(this.user.id) : creator == this.user.id;
}

module.exports = {
  name: 'serverbackup',
  permissions: { client: ['Administrator'], user: ['Administrator'] },
  cooldowns: { guild: 18e5 }, //30min
  slashCommand: true,
  deferReply: true, disabled: true,
  options: [
    { name: 'create', type: 'Subcommand' },
    {
      name: 'load',
      type: 'Subcommand',
      options: [
        {
          name: 'id',
          type: 'String',
          autocompleteOptions: function () { return [...this.client.backupSystem.list().filter(checkLoadPerm.bind(this)).keys()]; }
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
        autocompleteOptions: function () { return [...this.client.backupSystem.list(this.guild.id).keys()]; }
      }],
    },
    {
      name: 'delete',
      type: 'Subcommand',
      options: [{
        name: 'id',
        type: 'String',
        autocompleteOptions: function () { return [...this.client.backupSystem.list(this.guild.id).keys()]; },
        required: true
      }]
    }
  ], beta: true,

  /**@this {import('discord.js').CommandInteraction} */
  run: async function (lang) {
    if (this.options.getSubcommand() != 'load') await this.deferReply({ ephemeral: true });

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        color: Colors.White
      }),
      msg = this;

    switch (this.options.getSubcommand()) {
      case 'create': {
        const
          statusObj = new Proxy({ status: null }, {
            set: function (obj, prop, value) {
              obj[prop] = value;
              msg.editReply({ embeds: [embed.setDescription(lang(value))] });
              return true;
            }
          }),
          backup = await this.client.backupSystem.create(this.guild, { save: true, backupMembers: true, metadata: [this.user.id, this.guild.ownerId, [this.user.id, this.guild.ownerId], [...this.guild.members.cache.filter(e => e.permissions.has(PermissionFlagsBits.Administrator)).keys()]], statusObj });

        return this.editReply({ embeds: [embed.setDescription(lang('create.success', { id: backup.id, cmdId: this.commandId }))] });
      }

      case 'load': {
        const id = this.options.getString('id');
        if (this.user.id != this.guild.ownerId) return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('load.noPerm'))], ephemeral: true });
        if (!this.client.backupSystem.get()) return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('load.noneFound'))], ephemeral: true });

        if (!checkLoadPerm.call(this, this.client.backupSystem.get(id))) return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('load.backupNoPerm'))], ephemeral: true });
        //Validierung dass der user das backup laden darf
        const buttons = new ActionRowBuilder({
          components: [
            new ButtonBuilder({
              label: lang('load.overwriteWarningDescription'),
              customId: 'overwriteWarning',
              style: TextInputStyle.Short,
              value: lang('global.false'),
              required: true
            })
          ]
        });

        const msg = await this.editReply({ embeds: [embed.setDescription(lang('load.warning'))], components: [buttons] });
        const collector = await msg.createMessageComponentCollector

        const modal = await this.awaitModalSubmit({ filter: e => e.customId == 'overwriteWarning', time: 60000 });
        if (modal.fields.getTextInputValue('overwriteWarning') != lang('global.true')) return this.reply({ embeds: [embed.setColor('Red').setDescription(lang('load.cancelled'))], ephemeral: true });

        await this.member.send({ embeds: [embed.setDescription(lang('load.loadingEmbedDescription'))] });

        const
          statusObj = new Proxy({ status: null }, {
            set: function (obj, prop, value) {
              obj[prop] = value;
              msg.editReply({ embeds: [embed.setDescription(lang(value))] });
              return true;
            }
          }),
          backup = await this.client.backupSystem.load(id, this.guild, { reason: `Backup load command, member ${this.user.tag}`, statusObj, clearGuildBeforeRestore: !this.options.getBoolean('no_clear') });

        return this.editReply({ embeds: [embed.setDescription(lang('load.success', backup.id))] });
      }

      case 'delete': {
        //check for member being admin of that guild!!!!!!!!
        this.client.backupSystem.remove(this.options.getString('id'));
        return this.editReply({ embeds: [embed.setDescription(lang('delete.success'))], ephemeral: true });
      }

      case 'get': {
        const id = this.options.getString('id');

        embed.data.thumbnail = { url: this.guild.iconURL() };
        if (id) {
          const backup = this.client.backupSystem.get(id);
          return this.editReply({
            ephemeral: true,
            embeds: [backup
              ? embed.setDescription(lang('get.oneEmbedDescription', { id, ...getData(backup) }))
              : embed.setColor(Colors.Red).setDescription(lang('get.oneNotFound'))]
          });
        }

        embed.data.fields = this.client.backupSystem.list(this.guild.id).sort((a, b) => a.createdAt - b.createdAt).first(10).map(e => ({
          name: e.id, value: lang('get.infos', getData(e))
        }));

        if (embed.data.fields.length) embed.data.footer = { text: lang('get.found', this.client.backupSystem.list(this.guild.id).size) };
        return this.editReply({ embeds: [embed.setDescription(lang(embed.data.fields.length ? 'get.embedDescription' : 'get.noneFound'))] });
      }
    }
  }
};