/** @typedef {import('../../types/database').backupId}backupId*/

const
  { EmbedBuilder, Colors, ActionRowBuilder, PermissionFlagsBits, ButtonBuilder, ComponentType, ButtonStyle } = require('discord.js'),
  { DiscordAPIErrorCodes } = require('#Utils');

/** @param {Database['backups'][backupId]}backup*/
function getData(backup) {
  if (backup.__count__) {
    return {
      createdAt: Math.round(backup.createdAt.getTime() / 1000),
      size: (() => {
        const size = Buffer.byteLength(JSON.stringify(backup));
        return size > 1024 ? `${(size / 1024).toFixed(2)}KB` : `${size}B`;
      })(),
      members: backup.members?.length ?? 0,
      channels: (backup.channels.categories.length + backup.channels.others.length + backup.channels.categories.reduce((acc, e) => acc + e.children.length, 0)) || 0,
      roles: backup.roles.length,
      emojis: backup.emojis.length,
      stickers: backup.stickers.length
    };
  }
}

/**
 * @this {GuildInteraction}
 * @param {Database['backups'][backupId]}backup*/
function checkPerm(backup) {
  const creator = backup?.metadata[this.guild.db.serverbackup?.allowedToLoad ?? this.client.defaultSettings.serverbackup.allowedToLoad];
  return Array.isArray(creator) ? creator.includes(this.user.id) : creator == this.user.id;
}

/**
 * @param {GuildInteraction}interaction
 * @param {EmbedBuilder}embed
 * @param {lang}lang
 * @param {Record<string, string | number> | string | number}langKeys*/
function createProxy(interaction, embed, lang, langKeys) {
  return new Proxy({ status: undefined }, {
    set(obj, prop, value) {
      obj[prop] = value;
      void interaction.editReply({ embeds: [embed.setDescription(lang(value, langKeys))] });
      return true;
    }
  });
}

/** @type {Record<string, (this: GuildInteraction, lang: lang, EmbedBuilder: embed, id?: string) => Promise<Message>>} */
const backupMainFunctions = {
  create: async function createBackup(lang, embed) {
    embed.data.color = Colors.White;

    const
      statusObj = createProxy(this, embed, lang, getEmoji('loading')),
      backup = await this.client.backupSystem.create(this.guild, {
        save: true, backupMembers: true,
        metadata: [
          this.user.id, this.guild.ownerId, [this.user.id, this.guild.ownerId],
          [...this.guild.members.cache.filter(e => e.permissions.has(PermissionFlagsBits.Administrator)).keys()]
        ], statusObj
      });

    return this.editReply({ embeds: [embed.setDescription(lang('create.success', { id: backup.id, cmdId: this.commandId }))] });
  },

  load: async function loadBackup(lang, embed, id) {
    if (!this.client.backupSystem.get(id)) return this.editReply({ embeds: [embed.setDescription(lang('load.noneFound'))] });
    if (!checkPerm.call(this, this.client.backupSystem.get(id))) return this.editReply({ embeds: [embed.setDescription(lang('load.noPerm'))] });

    const component = new ActionRowBuilder({
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

    // Todo: convert to componentHandler
    return (await this.editReply({ embeds: [embed.setColor(Colors.DarkRed).setDescription(lang('load.overwriteWarningDescription'))], components: [component] }))
      .createMessageComponentCollector({ filter: i => i.user.id == this.user.id, componentType: ComponentType.Button, max: 1, time: 3e4 })
      .on('collect', async button => {
        await button.deferUpdate();
        if (button.customId != 'overwriteWarning_true') return this.editReply({ embeds: [embed.setDescription(lang('load.cancelled'))], components: [] });

        embed.data.color = Colors.White;
        let msg;
        try { msg = await this.member.send({ embeds: [embed.setDescription(lang('load.loadingEmbedDescription'))] }); }
        catch (err) {
          if (err.code != DiscordAPIErrorCodes.CannotSendMessagesToThisUser) throw err;

          return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('load.enableDMs'))], components: [] });
        }

        const statusObj = createProxy.call(this, embed, lang, getEmoji('loading'));

        try {
          const backup = await this.client.backupSystem.load(id, this.guild, {
            statusObj, reason: lang('global.modReason', { command: `${this.commandName} load`, user: this.user.tag }),
            clearGuildBeforeRestore: !this.options.getBoolean('no_clear')
          });
          return msg.edit({ embeds: [embed.setDescription(lang('load.success', backup.id))] });
        }
        catch (err) {
          void msg.edit({ embeds: [embed.setDescription(lang('load.error'))] });
          return log.error('An error occurred while trying to load an backup:', err);
        }
      })
      .on('end', collected => {
        if (collected.size) return;

        component.components[0].data.disabled = true;
        component.components[1].data.disabled = true;
        return this.editReply({ components: [component] });
      });
  },

  delete: async function deleteBackup(lang, embed, id) {
    if (this.user.id != this.guild.ownerId || !checkPerm.call(this, this.client.backupSystem.get(id)))
      return this.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('delete.noPerm'))] });

    await this.client.backupSystem.remove(id);
    return this.editReply({ embeds: [embed.setDescription(lang('delete.success'))] });
  },

  get: function getBackup(lang, embed, id) {
    embed.setColor(Colors.White).setThumbnail(this.guild.iconURL());

    if (id) {
      const backup = this.client.backupSystem.get(id);
      return void this.editReply({
        embeds: [backup
          ? embed.setDescription(lang('get.oneEmbedDescription', { id, ...getData(backup) }))
          : embed.setColor(Colors.Red).setDescription(lang('get.oneNotFound'))]
      });
    }

    embed.data.fields = this.client.backupSystem.list(this.guild.id).sort((a, b) => b.createdAt - a.createdAt)
      .first(10)
      .map(e => ({ name: e.id, value: lang('get.infos', getData(e)) }));

    if (embed.data.fields.length) embed.data.footer = { text: lang('get.found', this.client.backupSystem.list(this.guild.id).size) };
    return void this.editReply({ embeds: [embed.setDescription(lang(embed.data.fields.length ? 'get.embedDescription' : 'get.noneFound'))] });
  }
};

/** @type {command<'slash'>}*/
module.exports = {
  permissions: { client: ['Administrator'], user: ['Administrator'] },
  prefixCommand: false,
  slashCommand: true,
  disabled: true,
  disabledReason: 'This command is still in development',
  options: [
    {
      name: 'create',
      type: 'Subcommand',
      cooldowns: { guild: 18e5 } // 30min
    },
    {
      name: 'load',
      type: 'Subcommand',
      cooldowns: { guild: 3e5 }, // 5min
      options: [
        {
          name: 'id',
          type: 'String',
          autocompleteOptions() {
            return [...this.client.backupSystem.list().filter(checkPerm.bind(this)).keys()];
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

  run(lang) {
    const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

    return backupMainFunctions[this.options.getSubcommand()].call(this, lang, embed, this.options.getString('id'));
  }
};