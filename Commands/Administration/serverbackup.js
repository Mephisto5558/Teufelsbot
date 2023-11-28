const
  { EmbedBuilder, Colors, ActionRowBuilder, PermissionFlagsBits, ButtonBuilder, ComponentType, ButtonStyle } = require('discord.js'),
  { cooldowns } = require('../../Utils'),
  getData = backup => Object.keys(backup).length ? ({
    createdAt: Math.round(backup.createdTimestamp / 1000),
    size: (() => {
      const size = Buffer.byteLength(JSON.stringify(backup));
      return size > 1024 ? `${(size / 1024).toFixed(2)}KB` : `${size}B`;
    })(),
    members: backup.members?.length ?? 0,
    channels: (backup.channels.categories.length + backup.channels.others.length + backup.channels.categories.reduce((acc, e) => acc + e.children.length, 0)) || 0,
    roles: backup.roles?.length ?? 0,
    emojis: backup.emojis?.length ?? 0,
    stickers: backup.stickers?.length ?? 0
  }) : null;

/**@this GuildInteraction @param {object}backup*/
function checkPerm(backup) {
  const creator = backup?.metadata?.[this.guild.db.serverbackup?.allowedToLoad ?? this.client.defaultSettings.serverbackup.allowedToLoad];
  return Array.isArray(creator) ? creator.includes(this.user.id) : creator == this.user.id;
}

/**@type {command}*/
module.exports = {
  name: 'serverbackup',
  permissions: { client: ['Administrator'], user: ['Administrator'] },
  prefixCommand: false,
  slashCommand: true,
  disabled: true,
  disabledReason: 'This command is still in development',
  options: [
    {
      name: 'create',
      type: 'Subcommand',
      cooldowns: { guild: 1800000 } //30min
    },
    {
      name: 'load',
      type: 'Subcommand',
      cooldowns: { guild: 300000 }, //5min
      options: [
        {
          name: 'id',
          type: 'String',
          autocompleteOptions: function () { return [...this.client.backupSystem.list().filter(checkPerm.bind(this)).keys()]; }
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
        required: true,
        autocompleteOptions: function () { return [...this.client.backupSystem.list(this.guild.id).keys()]; }
      }]
    }
  ], beta: true,

  /**@this GuildInteraction*/
  run: async function (lang) {
    const
      id = this.options.getString('id'),
      embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.White }),
      msg = this;

    switch (this.options.getSubcommand()) {
      case 'create': {
        const cooldown = cooldowns.call(this, { name: 'serverbackup.create', cooldowns: { guild: 18e5 } });
        if (cooldown) return this.customReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('create.cooldown', cooldown))] }, 1e4);

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
        const cooldown = cooldowns.call(this, { name: 'serverbackup.load', cooldowns: { guild: 18e5, user: 18e5 } });
        if (cooldown) return this.customReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('load.cooldown', cooldown))] }, 1e4);

        embed.data.color = Colors.Red;
        if (!this.client.backupSystem.get()) return this.editReply({ embeds: [embed.setDescription(lang('load.noneFound'))] });
        if (!checkPerm.call(this, this.client.backupSystem.get(id))) return this.editReply({ embeds: [embed.setDescription(lang('load.backupNoPerm'))] });

        const buttons = new ActionRowBuilder({
          components: [
            new ButtonBuilder({
              label: lang('global.true'),
              customId: 'overwriteWarning_true',
              style: ButtonStyle.Danger
            }),
            new ButtonBuilder({
              label: lang('global.false'),
              customId: 'overwriteWarning_false',
              style: ButtonStyle.Success
            })
          ]
        });

        return (await this.editReply({ embeds: [embed.setColor(Colors.DarkRed).setDescription(lang('load.overwriteWarningDescription'))], components: [buttons] }))
          .createMessageComponentCollector({ filter: i => i.user.id == this.user.id, componentType: ComponentType.Button, max: 1, time: 30000 })
          .on('collect', async button => {
            await button.deferUpdate();
            if (button.customId != 'overwriteWarning_true') return this.editReply({ embeds: [embed.setDescription(lang('load.cancelled'))], components: [] });

            embed.data.color = Colors.White;
            let msg;
            try { msg = await this.member.send({ embeds: [embed.setDescription(lang('load.loadingEmbedDescription'))] }); }
            catch { return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('load.enableDMs'))], components: [] }); }

            try {
              const
                statusObj = new Proxy({ status: null }, {
                  set: function (obj, prop, value) {
                    obj[prop] = value;
                    msg.edit({ embeds: [embed.setDescription(lang(value))] });
                    return true;
                  }
                }),
                backup = await this.client.backupSystem.load(id, this.guild, { reason: lang('global.modReason', { command: `${this.commandName} load`, user: this.user.tag }), statusObj, clearGuildBeforeRestore: !this.options.getBoolean('no_clear') });

              return msg.edit({ embeds: [embed.setDescription(lang('load.success', backup.id))] });
            }
            catch (err) {
              msg.edit({ embeds: [embed.setDescription(lang('load.error'))] });
              return log.error('An error occurred while trying to load an backup:', err);
            }
          })
          .on('end', collected => {
            if (collected.size) return;

            buttons.components[0].data.disabled = true;
            buttons.components[1].data.disabled = true;
            return this.editReply({ components: [buttons] });
          });
      }

      case 'delete': {
        if (this.user.id != this.guild.ownerId || !checkPerm.call(this, this.client.backupSystem.get(id))) return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('delete.noPerm'))] });

        this.client.backupSystem.remove(id);
        return this.editReply({ embeds: [embed.setDescription(lang('delete.success'))] });
      }

      case 'get': {
        embed.data.thumbnail = { url: this.guild.iconURL() };
        if (id) {
          const backup = this.client.backupSystem.get(id);
          return this.editReply({
            embeds: [backup
              ? embed.setDescription(lang('get.oneEmbedDescription', { id, ...getData(backup) }))
              : embed.setColor(Colors.Red).setDescription(lang('get.oneNotFound'))]
          });
        }

        embed.data.fields = this.client.backupSystem.list(this.guild.id).sort((a, b) => b.createdAt - a.createdAt).first(10).map(e => ({
          name: e.id, value: lang('get.infos', getData(e))
        }));

        if (embed.data.fields.length) embed.data.footer = { text: lang('get.found', this.client.backupSystem.list(this.guild.id).size) };
        return this.editReply({ embeds: [embed.setDescription(lang(embed.data.fields.length ? 'get.embedDescription' : 'get.noneFound'))] });
      }
    }
  }
};