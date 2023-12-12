const
  { Constants, ButtonBuilder, EmbedBuilder, ButtonStyle, ActionRowBuilder, Colors, ComponentType, PermissionFlagsBits } = require('discord.js'),
  { entersState, joinVoiceChannel, VoiceConnectionStatus, EndBehaviorType } = require('@discordjs/voice'),
  { Decoder } = require('prism-media').opus,
  { createWriteStream, promises: { unlink, access } } = require('fs'),
  exec = require('util').promisify(require('child_process').exec),
  ffmpeg = require('ffmpeg-static');

/**@type {command}*/
module.exports = {
  name: 'record',
  cooldowns: { user: 1000 },
  slashCommand: true,
  prefixCommand: false,
  options: [
    { name: 'target', type: 'User' },
    {
      name: 'channel',
      type: 'Channel',
      channelTypes: Constants.VoiceBasedChannelTypes
    },
    { name: 'public', type: 'Boolean' }
  ],

  /**@this GuildInteraction*/
  run: async function (lang) {
    const
      allowed = new Set(),
      collected = new Set(),
      /**@type {import('discord.js').VoiceBasedChannel} */
      voiceChannel = this.options.getChannel('channel') || this.options.getMember('target')?.voice.channel || this.member.voice.channel,
      target = voiceChannel?.members.get(this.options.getMember('target')?.id),
      targets = (target ? [target] : [...(voiceChannel?.members?.values() ?? [])]).filter(e => e?.voice.channel && !e.user.bot),
      isPublic = this.options.getBoolean('public');

    if (!voiceChannel) return this.editReply(lang('needVoiceChannel'));
    if (!voiceChannel.joinable) return this.editReply(lang('cannotJoin'));
    if (!targets.length) return this.editReply(lang('noTarget'));

    this.deleteReply();

    const
      embed = new EmbedBuilder({
        title: lang('embedTitle'),
        description: lang('embedDescription', { user: this.user.id, channel: voiceChannel.id, publicOrPrivate: isPublic ? lang('isPublic') : lang('isPrivate') }),
        footer: { text: this.user.tag, iconURL: this.member.displayAvatarURL({ forceStatic: true }) },
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
      msg = await this.channel.send({
        content: targets.reduce((e, acc) => `${acc}, ${e}`, ''),
        embeds: [embed], components: [component]
      }),
      collector = msg.createMessageComponentCollector({ filter: i => targets.includes(i.member), componentType: ComponentType.Button, time: 2e4 });

    collector.on('collect', async button => {
      await button.reply({ content: lang('updated', lang(button.customId == 'allow' ? 'allow' : 'deny')), ephemeral: true });

      collected.add(button.user.id);
      if (button.customId == 'allow') allowed.add(button.member.id);
      if (collected.size == targets.length) collector.stop();
    });

    collector.on('end', async () => {
      if (!allowed.size) {
        embed.data.description = lang('denied');
        return msg.edit({ content: '', embeds: [embed], components: [] });
      }

      if (this.guild.members.me.voice.serverDeaf) {
        if (this.guild.members.me.permissionsIn(voiceChannel).missing(PermissionFlagsBits.DeafenMembers)) {
          embed.data.description = lang('deaf');
          return msg.edit({ embeds: [embed], components: [] });
        }
        this.guild.members.me.voice.setDeaf(false, `Record start command, member ${this.user.tag}`);
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

      try { await entersState(connection, VoiceConnectionStatus.Ready, 2e4); }
      catch { return msg.edit({ embeds: [embed.setDescription(lang('cantConnect'))] }); }

      msg.edit({ embeds: [embed.setDescription(lang('recording', { channel: voiceChannel, users: `<@${[...allowed].join('>, <@')}>` }))], components: [buttons] });

      const filename = `${Date.now()}_${voiceChannel.id}_${[...allowed].join('_')}`;

      connection.receiver.speaking.on('start', userId => {
        if (!allowed.has(userId)) return;

        connection.receiver
          .subscribe(userId, {
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

            return button.update({ embeds: [embed], components: [buttons] });
          }

          case 'stop': {
            connection.destroy();

            try { await access(`./VoiceRecords/raw/${filename}.ogg`); }
            catch {
              pauseStopCollector.stop();
              embed.data.description = lang('notFound');
              embed.data.color = Colors.Green;

              return button.update({ embeds: [embed], components: [] });
            }

            embed.data.description = lang('global.loading');
            button.update({ embeds: [embed], components: [] });

            await exec(`"${ffmpeg}" -f s16le -ar 48k -ac 2 -i "./VoiceRecords/raw/${filename}.ogg" "./VoiceRecords/${filename}.mp3"`);
            await unlink(`./VoiceRecords/raw/${filename}.ogg`);

            if (isPublic) {
              pauseStopCollector.stop();

              await msg.edit({
                content: lang('success'),
                files: [`./VoiceRecords/${filename}.mp3`],
                embeds: []
              });

              return unlink(`./VoiceRecords/${filename}.mp3`);
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
            return button.reply({
              content: lang('success'),
              files: [`./VoiceRecords/${filename}.mp3`],
              ephemeral: true
            });
          }
        }
      });
    });
  }
};