const
  { EmbedBuilder, Colors, ActionRowBuilder, PermissionFlagsBits, ButtonBuilder, ComponentType, ButtonStyle } = require('discord.js'),
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

const backupMainFunctions = {
  /**@param {GuildInteraction}interaction @param {lang}lang @param {EmbedBuilder}embed*/
  create: async function createBackup(interaction, lang, embed) {
    embed.data.color = Colors.White;

    const
      statusObj = new Proxy({ status: null }, {
        set: function (obj, prop, value) {
          obj[prop] = value;
          interaction.editReply({ embeds: [embed.setDescription(lang(value))] });
          return true;
        }
      }),
      backup = await interaction.client.backupSystem.create(interaction.guild, { save: true, backupMembers: true, metadata: [interaction.user.id, interaction.guild.ownerId, [interaction.user.id, interaction.guild.ownerId], [...interaction.guild.members.cache.filter(e => e.permissions.has(PermissionFlagsBits.Administrator)).keys()]], statusObj });

    return interaction.editReply({ embeds: [embed.setDescription(lang('create.success', { id: backup.id, cmdId: interaction.commandId }))] });
  },

  /**@param {GuildInteraction}interaction @param {lang}lang @param {EmbedBuilder}embed @param {string}id*/
  load: async function loadBackup(interaction, lang, embed, id) {
    if (!interaction.client.backupSystem.get()) return interaction.editReply({ embeds: [embed.setDescription(lang('load.noneFound'))] });
    if (!checkPerm.call(interaction, interaction.client.backupSystem.get(id))) return interaction.editReply({ embeds: [embed.setDescription(lang('load.backupNoPerm'))] });

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

    // Todo: convert to componentHandler
    return (await interaction.editReply({ embeds: [embed.setColor(Colors.DarkRed).setDescription(lang('load.overwriteWarningDescription'))], components: [buttons] }))
      .createMessageComponentCollector({ filter: i => i.user.id == interaction.user.id, componentType: ComponentType.Button, max: 1, time: 30000 })
      .on('collect', async button => {
        await button.deferUpdate();
        if (button.customId != 'overwriteWarning_true') return interaction.editReply({ embeds: [embed.setDescription(lang('load.cancelled'))], components: [] });

        embed.data.color = Colors.White;
        let interaction;
        try { interaction = await interaction.member.send({ embeds: [embed.setDescription(lang('load.loadingEmbedDescription'))] }); }
        catch (err) {
          if (err.code != 50007) throw err; // "Cannot send messages to this user"

          return interaction.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('load.enableDMs'))], components: [] });
        }

        const statusObj = new Proxy({ status: null }, {
          set: function (obj, prop, value) {
            obj[prop] = value;
            interaction.edit({ embeds: [embed.setDescription(lang(value))] });
            return true;
          }
        });

        try {
          const backup = await interaction.client.backupSystem.load(id, interaction.guild, { reason: lang('global.modReason', { command: `${interaction.commandName} load`, user: interaction.user.tag }), statusObj, clearGuildBeforeRestore: !interaction.options.getBoolean('no_clear') });
          return interaction.edit({ embeds: [embed.setDescription(lang('load.success', backup.id))] });
        }
        catch (err) {
          interaction.edit({ embeds: [embed.setDescription(lang('load.error'))] });
          return log.error('An error occurred while trying to load an backup:', err);
        }
      })
      .on('end', collected => {
        if (collected.size) return;

        buttons.components[0].data.disabled = true;
        buttons.components[1].data.disabled = true;
        return interaction.editReply({ components: [buttons] });
      });
  },

  /**@param {GuildInteraction}interaction @param {lang}lang @param {EmbedBuilder}embed @param {string}id*/
  delete: async function deleteBackup(interaction, lang, embed, id) {
    if (interaction.user.id != interaction.guild.ownerId || !checkPerm.call(interaction, interaction.client.backupSystem.get(id))) return interaction.editReply({ embeds: [embed.setColor(Colors.Red).setDescription(lang('delete.noPerm'))] });

    interaction.client.backupSystem.remove(id);
    return interaction.editReply({ embeds: [embed.setDescription(lang('delete.success'))] });
  },

  /**@param {GuildInteraction}interaction @param {lang}lang @param {EmbedBuilder}embed @param {string}id*/
  get: async function getBackup(interaction, lang, embed, id) {
    embed.setColor(Colors.White).setThumbnail(this.guild.iconURL());

    if (id) {
      const backup = interaction.client.backupSystem.get(id);
      return interaction.editReply({
        embeds: [backup
          ? embed.setDescription(lang('get.oneEmbedDescription', { id, ...getData(backup) }))
          : embed.setColor(Colors.Red).setDescription(lang('get.oneNotFound'))]
      });
    }

    embed.data.fields = interaction.client.backupSystem.list(interaction.guild.id).sort((a, b) => b.createdAt - a.createdAt).first(10).map(e => ({
      name: e.id, value: lang('get.infos', getData(e))
    }));

    if (embed.data.fields.length) embed.data.footer = { text: lang('get.found', interaction.client.backupSystem.list(interaction.guild.id).size) };
    return interaction.editReply({ embeds: [embed.setDescription(lang(embed.data.fields.length ? 'get.embedDescription' : 'get.noneFound'))] });
  }
};

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
    const embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

    return backupMainFunctions[this.options.getSubcommand()](this, lang, embed, this.options.getString('id'));
  }
};