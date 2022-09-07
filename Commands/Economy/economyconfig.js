const { PermissionFlagsBits, EmbedBuilder, Colors } = require('discord.js');

module.exports = {
  name: 'economyconfig',
  aliases: { prefix: [], slash: [] },
  description: 'Economy Configuration for users and admins',
  usage: '',
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 0 },
  category: 'Economy',
  prefixCommand: false,
  slashCommand: true,
  options: [
    {
      name: 'user',
      description: 'Configuration for your economy in this guild.',
      type: 'SubcommandGroup',
      options: [
        {
          name: 'start',
          description: 'Start using the economy commands!',
          type: 'Subcommand',
        },
        {
          name: 'delete',
          description: "DELETE all your economy data! This is irreversible!",
          type: 'Subcommand',
          options: [{
            name: 'confirmation',
            description: 'Write "CLEAR ALL" to confirm deleting your economy data for this guild.',
            type: 'String',
            required: true
          }]
        }
      ]
    },
    {
      name: 'admin',
      description: 'Configurate the economy in this guild.',
      type: 'SubcommandGroup',
      options: [
        {
          name: 'toggle',
          description: 'Enable/Disable the economy for this guild.',
          type: 'Subcommand'
        },
        {
          name: 'clear',
          description: 'DELETE ALL ECONOMY DATA (including config). This is irreversible!',
          type: 'Subcommand',
          options: [{
            name: 'confirmation',
            description: 'Write "CLEAR ALL" to confirm deleting the guild\'s economy data.',
            type: 'String',
            required: true
          }]
        },
        {
          name: 'blacklist',
          description: 'Allow or disallow something or someone for all gaining methods.',
          type: 'Subcommand',
          options: [
            {
              name: 'channel',
              description: 'Allow or disallow a channel from all gaining methods (eg. chat messages in a spam channel).',
              type: 'Channel',
              channelTypes: ['GuildText', 'GuildNews'],
              required: false
            },
            {
              name: 'role',
              description: 'Allow or disallow a role from all gaining methods (eg. chat messages in all channels).',
              type: 'Role',
              required: false
            },
            {
              name: 'user',
              description: 'Allow or disallow a user from all gaining methods (eg. chat messages in all channels).',
              type: 'User',
              required: false
            }
          ]
        },
        {
          name: 'gaining_rules',
          description: 'Rules all about gaining. Use the "get" option for the current settings.',
          type: 'Subcommand',
          options: [
            {
              name: 'get',
              description: 'Get all settings and their values.',
              type: 'Boolean',
              required: false
            },
            {
              name: 'min_message_length',
              description: 'The minimum message length required to get souls.',
              type: 'Number',
              minValue: 0,
              maxValue: 5000,
              required: false
            },
            {
              name: 'max_message_length',
              description: 'The maximum message length required to get souls.',
              type: 'Number',
              minValue: 0,
              maxValue: 5000,
              required: false
            }
          ]
        }
      ]
    }
  ], beta: true,

  run: async (interaction, lang, { db }) => {
    if (interaction.options.getSubcommandGroup() == 'user') {
      switch (interaction.options.getSubcommand()) {
        case 'start': {
          const defaultSettings = db.get('guildSettings').default.economy;

          if (db.get('guildSettings')[interaction.guild.id]?.economy?.[interaction.user.id]?.gaining?.chat)
            return interaction.editReply(lang('start.alreadyInitiated'));

          db.set('guildSettings', db.get('guildSettings').fMerge({
            [interaction.guild.id]: {
              economy: {
                [interaction.user.id]: {
                  currency: defaultSettings.currency ?? 0,
                  currencyCapacity: defaultSettings.currencyCapacity,
                  power: defaultSettings.power ?? 0,
                  defense: defaultSettings.defense ?? 0,
                  dailyStreak: 0,
                  slaves: 0,
                  maxSlaves: defaultSettings.maxSlaves,
                  maxConcurrentResearches: defaultSettings.maxConcurrentResearches,
                  gaining: defaultSettings.gaining,
                  skills: Object.fromEntries(Object.entries(defaultSettings.skills).map(([skill, { ...e }]) => {
                    delete e.firstPrice;
                    e.lastPrice = 0;

                    if (!e.onCooldownUntil) e.onCooldownUntil = 0;
                    if (!e.lvl) e.lvl = 0;
                    if (!e.maxLvl) e.maxLvl = 0;
                    if (!e.percentage) e.percentage = 18;

                    return [skill, e];
                  }))
                }
              }
            }
          }));

          return interaction.editReply(lang('start.success'));
        }

        case 'delete': {
          if (!interaction.options.getString('confirmation')?.toLowerCase() == lang('confirmation'))
            return interaction.editReply(lang('user.delete.needConfirm'));

          const oldData = db.get('guildSettings');
          delete oldData[interaction.guild.id]?.economy?.[interaction.user.id];

          db.set('guildSettings', oldData);

          return interaction.editReply(lang('user.delete.success'));
        }
      }
    }
    else if (interaction.options.getSubcommandGroup() == 'admin') {
      if (!interaction.member.permissions.has(PermissionFlagsBits.ManageGuild))
        return interaction.customReply(lang('admin.noPerm'), 30000);

      switch (interaction.options.getSubcommand()) {
        case 'toggle': {
          const
            oldData = db.get('guildSettings'),
            enable = oldData[interaction.guild.id]?.economy?.enable;

          db.set('guildSettings', oldData.fMerge({ [interaction.guild.id]: { economy: { enable: !enable } } }));
          return interaction.editReply(lang('admin.toggle.success', enable ? lang('global.disabled') : lang('global.enabled')));
        }

        case 'clear': {
          if (!interaction.options.getString('confirmation')?.toLowerCase() == lang('confirmation'))
            return interaction.editReply(lang('admin.clear.needConfirm'));

          const oldData = db.get('guildSettings');
          oldData[interaction.guild.id].economy = { enable: false };

          db.set('guildSettings', oldData);
          return interaction.editReply(lang('admin.clear.success'));
        }

        case 'blacklist': {
          const
            channel = interaction.options.getChannel('channel'),
            role = interaction.options.getRole('role'),
            user = interaction.options.getUser('user'),
            blacklist = db.get('guildSettings')[interaction.guild.id]?.economy?.config?.blacklist || {};

          if (!channel && !role && !user) {
            const
              max = msg => !msg || msg.length < 1024 ? msg : msg.substring(0, 1021) + '...',
              channelList = max(blacklist.channels?.map(e => `<#${e}>`).join(', ')),
              roleList = max(blacklist.roles?.map(e => `<@&${e}>`).join(', ')),
              userList = max(blacklist.user?.map(e => `<@${e}>`).join(', ')),
              embed = new EmbedBuilder({
                title: lang('admin.blacklist.embedTitle'),
                description: lang('admin.blacklist.listEmbedDescription'),
                fields: [
                  { name: lang('admin.blacklist.channels'), value: channelList || lang('global.none'), inline: false },
                  { name: lang('admin.blacklist.roles'), value: roleList || lang('global.none'), inline: false },
                  { name: lang('admin.blacklist.user'), value: userList || lang('global.none'), inline: false }
                ],
                color: Colors.White
              });

            return interaction.editReply({ embeds: [embed] });
          }
          const
            status = { channel: channel ? `+ ${channel.name}` : lang('global.none'), role: role ? `+ ${role.name}` : lang('global.none'), user: user ? `+ ${user.tag}` : lang('global.none') },
            work = (id, type, list = []) => {
              if (list.includes(id)) {
                list = list.filter(e => e != id);
                status[type][0] = '-';
              }
              else if (id) list.push(id);

              return list;
            }

          blacklist.channels = work(channel?.id, 'channel', blacklist.channels);
          blacklist.roles = work(role?.id, 'role', blacklist.roles);
          blacklist.user = work(user?.id, 'user', blacklist.user);

          db.set('guildSettings', db.get('guildSettings').fMerge({
            [interaction.guild.id]: { economy: { config: { blacklist } } }
          }, 'overwrite'));

          const embed = new EmbedBuilder({
            title: lang('admin.blacklist.embedTitle'),
            description: lang('admin.blacklist.setEmbedDescription', { channel: status.channel, role: status.role, user: status.user }),
            footer: { text: lang('admin.blacklist.setFooterText') },
            color: Colors.White
          });

          return interaction.editReply({ embeds: [embed] });
        }

        case 'gaining_rules': {
          const
            get = interaction.options.getBoolean('get'),
            oldConfig = db.get('guildSettings')[interaction.guild.id]?.economy?.config || db.get('guildSettings').default.economy.config;

          const config = Object.fromEntries(Object.entries({
            minMessageLength: interaction.options.getNumber('min_message_length'),
            maxMessageLength: interaction.options.getNumber('max_message_length')
          }).filter(([k, v]) => v !== null && v != oldConfig[k]));

          if (get || !config) {
            const embed = new EmbedBuilder({
              title: lang('admin.gainingRules.getEmbedTitle'),
              //description: lang('admin.gainingRules.getEmbedDescription'),
              color: Colors.White,
              description: `Good-Looking text coming soon.\n\n\`\`\`json\n${JSON.stringify(db.get('guildSettings').default.economy.config.fMerge(oldConfig), null, 2)}\n\`\`\``
              //fields: Object.entries(db.get('guildSettings').default.economy.config.fMerge(oldConfig)).slice(0, 25).map(([k, v]) => ({ name: lang(`admin.gainingRules.getConfigList.${k}`), value: v, inline: true }))
            });

            return interaction.editReply({ embeds: [embed] });
          }

          if (!Object.keys(config).length) return interaction.customReply(lang('admin.gainingRules.nothingChanged'));
          return interaction.editReply('WIP');
          db.set('guildSettings', db.get('guildSettings').fMerge({ [interaction.guild.id]: { economy: { config } } }));

          return interaction.editReply(lang('admin.gainingRules.setSuccess', Object.entries(config).length));
        }
      }
    }
  }
}