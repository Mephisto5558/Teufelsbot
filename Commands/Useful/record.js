const
  { ButtonBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, Colors, ComponentType, PermissionFlagsBits } = require('discord.js'),
  { entersState, joinVoiceChannel, VoiceConnectionStatus, EndBehaviorType } = require('@discordjs/voice'),
  { Decoder } = require('prism-media').opus,
  { createWriteStream, unlinkSync, existsSync } = require('fs'),
  exec = require('util').promisify(require('child_process').exec),
  ffmpeg = require('ffmpeg-static');

module.exports = {
  name: 'record',
  aliases: { prefix: [], slash: [] },
  permissions: { client: [], user: [] },
  cooldowns: { guild: 0, user: 1000 },
  category: 'Useful',
  slashCommand: true,
  prefixCommand: false,
  options: [
    { name: 'target', type: 'User' },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: ['GuildVoice', 'GuildStageVoice']
    },
    { name: 'public', type: 'Boolean' }
  ],

  run: async (interaction, lang) => {
    const
      allowed = new Set(),
      collected = new Set(),
      voiceChannel = interaction.options.getChannel('channel') || interaction.options.getMember('target')?.voice.channel || interaction.member.voice.channel,
      target = voiceChannel?.members.get(interaction.options.getMember('target')?.id),
      targets = (target ? [target] : [...(voiceChannel?.members?.values() ?? [])]).filter(e => e?.voice.channel && !e.user.bot),
      isPublic = interaction.options.getBoolean('public');

    if (!voiceChannel) return interaction.editReply(lang('needVoiceChannel'));
    if (!voiceChannel.joinable) return interaction.editReply(lang('cannotJoin'));
    if (!targets.length) return interaction.editReply(lang('noTarget'));

    interaction.deleteReply();

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription', { user: interaction.user.id, channel: voiceChannel.id, publicOrPrivate: isPublic ? lang('isPublic') : lang('isPrivate') }),
        footer: { text: interaction.user.tag, iconURL: interaction.member.displayAvatarURL({ forceStatic: true }) },
        color: Colors.Red
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            customId: 'allow',
            label: lang('allow'),
            style: ButtonStyle.Success
          }),
          new ButtonBuilder({
            customId: 'deny',
            label: lang('deny'),
            style: ButtonStyle.Danger
          })
        ]
      }),
      msg = await interaction.channel.send({
        content: targets.reduce((e, acc) => `${acc}, ${e}`).toString(),
        embeds: [embed], components: [component]
      }),
      collector = msg.createMessageComponentCollector({ filter: i => targets.includes(i.member), componentType: ComponentType.Button, time: 20000 });

    collector.on('collect', async button => {
      await button.reply({ content: lang('updated', lang(button.customId == 'allow' ? 'allow' : 'deny')), ephemeral: true });

      collected.add(button.user.id);
      if (button.customId == 'allow') allowed.add(button.member.id);
      if (collected.size == targets.length) collector.stop();
    });

    collector.on('end', async _ => {
      if (!allowed.size) {
        embed.data.description = lang('denied');
        return msg.edit({ content: '', embeds: [embed], components: [] });
      }

      if (interaction.guild.members.me.voice.serverDeaf) {
        if (interaction.guild.members.me.permissionsIn(voiceChannel).missing(PermissionFlagsBits.DeafenMembers)) {
          embed.data.description = lang('deaf');
          return msg.edit({ embeds: [embed], components: [] });
        }
        interaction.guild.members.me.voice.setDeaf(false, `Record start command, member ${interaction.user.tag}`);
      }

      const buttons = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            customId: 'pause',
            label: lang('pause'),
            style: ButtonStyle.Primary
          }),
          new ButtonBuilder({
            customId: 'stop',
            label: lang('stop'),
            style: ButtonStyle.Danger
          })
        ]
      });

      embed.data.description = lang('global.loading');
      embed.data.color = Colors.Green;

      msg.edit({ content: '', embeds: [embed], components: [] });

      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        selfDeaf: false,
        selfMute: true,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator
      });
      try { await entersState(connection, VoiceConnectionStatus.Ready, 20000) }
      catch {
        embed.data.description = lang('cantConnect');
        return msg.edit({ embeds: [embed] });
      }

      embed.data.description = lang('recording', { channel: voiceChannel, users: `<@${[...allowed].join('>, <@')}>` });
      msg.edit({ embeds: [embed], components: [buttons] });

      const filename = `${Date.now()}_${voiceChannel.id}_${[...allowed].join('_')}`;

      connection.receiver.speaking.on('start', userId => {
        if (!allowed.has(userId)) return;

        connection.receiver.subscribe(userId, {
          end: {
            behavior: EndBehaviorType.AfterSilence,
            duration: 100,
          },
        })
          .pipe(new Decoder({ channels: 2, rate: 48000 }))
          .pipe(createWriteStream(`./VoiceRecords/raw/${filename}.ogg`, { flags: 'a' }));
      });

      const pauseStopCollector = msg.createMessageComponentCollector({ filter: i => allowed.has(i.user.id), componentType: ComponentType.Button });
      pauseStopCollector.on('collect', async button => {
        await button.deferUpdate();

        switch (button.customId) {
          case 'pause': {
            const deaf = button.guild.members.me.voice.deaf;
            button.guild.members.me.voice.setDeaf(!deaf);

            if (deaf) {
              embed.data.description = lang('recording', { channel: voiceChannel, users: `<@${[...allowed].join('>, <@')}>` });
              embed.data.color = Colors.Green;
              buttons.components[0].data.label = lang('pause');
            }
            else {
              embed.data.description = lang('paused', voiceChannel.toString());
              embed.data.color = Colors.Red;
              buttons.components[0].data.label = lang('resume');
            }

            return msg.edit({ embeds: [embed], components: [buttons] });
          }

          case 'stop': {
            connection.destroy();

            if (!existsSync(`./VoiceRecords/raw/${filename}.ogg`)) {
              pauseStopCollector.stop();
              embed.data.description = lang('notFound');
              embed.data.color = Colors.Green;

              return msg.edit({ embeds: [embed], components: [] });
            }

            embed.data.description = lang('global.loading');
            msg.edit({ embeds: [embed], components: [] });

            await exec(`"${ffmpeg}" -f s16le -ar 48k -ac 2 -i "./VoiceRecords/raw/${filename}.ogg" "./VoiceRecords/${filename}.mp3"`);
            unlinkSync(`./VoiceRecords/raw/${filename}.ogg`);

            if (isPublic) {
              pauseStopCollector.stop();

              await msg.edit({
                content: lang('success'),
                files: [`./VoiceRecords/${filename}.mp3`],
                embeds: []
              });

              return unlinkSync(`./VoiceRecords/${filename}.mp3`);
            }

            buttons.components = [new ButtonBuilder({
              customId: 'get',
              label: lang('get'),
              style: ButtonStyle.Primary
            })];

            embed.data.description = lang('privateReady');

            return msg.edit({ embeds: [embed], components: [buttons] });
          }

          case 'get': {
            button.channel.send({
              content: lang('success'),
              files: [`./VoiceRecords/${filename}.mp3`],
              ephemeral: true
            });
          }
        }
      })
    })
  }
}