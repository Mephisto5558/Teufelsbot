const
  { EmbedBuilder, Colors, ModalBuilder, ActionRowBuilder, TextInputBuilder, TextInputStyle, PermissionFlagsBits } = require('discord.js'),
  cooldowns = require('./cooldowns.js'),
  bankick = require('./bankick.js'),
  checkTarget = require('./checkTargetBanPerm.js');

/**@this {import('discord.js').ButtonInteraction}*/
module.exports = async function buttonPressHandler(lang) {
  const [feature, id, mode, data, ...args] = this.customId.split('.');
  const cooldown = cooldowns.call(this, { name: `buttonPressEvent.${id || Math.floor(Date.now() / 2e5)}` });
  if (cooldown) return this.reply(lang('events.buttonPressOnCooldown', cooldown));

  switch (feature) {
    case 'selfrole': {
      await this.deferReply({ ephemeral: true });

      lang.__boundArgs__[0].backupPath = 'events.selfrole';

      const successEmbed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Green });
      const errorEmbed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red });

      let role;
      try { role = await this.guild.roles.fetch(data); }
      catch { return this.editReply({ embeds: [errorEmbed.setDescription(lang('roleNotFound'))] }); }

      if (!this.member.manageable) return this.editReply({ embeds: [errorEmbed.setDescription(lang('noPermMember'))] });
      if (role.comparePositionTo(this.guild.members.me.roles.highest) > -1) return this.editReply({ embeds: [errorEmbed.setDescription(lang('noPermRole', role.id))] });

      let count = parseInt(this.component.label.match(/(\d*)\]$/)?.[1])?.limit({ min: 0 }) || 0;

      switch (mode) {
        case 'add': {
          if (this.member.roles.cache.has(role.id)) return this.editReply({ embeds: [errorEmbed.setDescription(lang('hasRoleAlready', role.id))] });
          await this.member.roles.add(role);
          if (args.includes('count') && this.component.label) {
            this.component.data.label = this.component.label.replace(/\d*\]$/, `${count + 1}]`);
            this.message.edit({ components: this.message.components });
          }
          return this.editReply({ embeds: [successEmbed.setDescription(lang('addSuccess', role.id))] });
        }

        case 'remove': {
          if (!this.member.roles.cache.has(role.id)) return this.editReply({ embeds: [errorEmbed.setDescription(lang('missesRole', role.id))] });
          await this.member.roles.remove(role);
          if (args.includes('count') && this.component.label) {
            this.component.data.label = this.component.label.replace(/\d*\]$/, `${count - 1}]`).limit({ min: 0 });
            this.message.edit({ components: this.message.components });
          }
          return this.editReply({ embeds: [successEmbed.setDescription(lang('removeSuccess', role.id))] });
        }

        case 'toggle': {
          if (this.member.roles.cache.has(role.id)) {
            await this.member.roles.remove(role);
            this.editReply({ embeds: [successEmbed.setDescription(lang('removeSuccess', role.id))] });
            count--;
          }
          else {
            await this.member.roles.add(role);
            this.editReply({ embeds: [successEmbed.setDescription(lang('addSuccess', role.id))] });
            count++;
          }

          if (args.includes('count') && this.component.label) {
            this.component.data.label = this.component.label.replace(/\d*\]$/, `${count}]`);
            this.message.edit({ components: this.message.components });
          }
          return;
        }
      }
      break;
    }

    case 'infoCMDs': {
      if (data != 'members') await this.deferReply();

      lang.__boundArgs__[0].backupPath = `events.infoCMDs.${data}`;
      const
        embed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red }),
        item = await this.guild[data].fetch(id).catch(() => { });

      if (!item) return this.customReply({ embeds: [embed.setDescription(lang('notFound'))], ephemeral: true });

      if (mode == 'delete' && (data == 'emojis' || data == 'roles')) {
        if (!this.member.permissions.has(PermissionFlagsBits[data == 'emojis' ? 'ManageEmojisAndStickers' : 'ManageRoles']) || (data == 'roles' ? (item.position > this.member.roles.highest.position && this.user.id != this.guild.ownerId) : false)) return this.editReply({ embeds: [embed.setDescription(lang('global.noPermUser'))] });

        if (!item[data == 'emojis' ? 'deletable' : 'editable']) return this.editReply({ embeds: [embed.setDescription(lang('noPerm'))] });

        await item.delete(`${data.slice(0, -1)} delete button in /${data.slice(0, -1)}info, member ${this.user.tag}`);

        this.editReply({ embeds: [embed.setColor(Colors.Green).setDescription(lang('success'))] });
      }
      else if (data == 'members') {
        if (!this.member.permissions.has(PermissionFlagsBits[mode == 'kick' ? 'KickMembers' : 'BanMembers'])) return this.reply({ embeds: [embed.setDescription(lang('global.noPermUser'))], ephemeral: true });
        const err = checkTarget.call(this, item, lang);
        if (err) return this.reply({ embeds: [embed.setDescription(err)], ephemeral: true });

        const modal = new ModalBuilder({
          title: lang('modalTitle'),
          customId: 'infoCMds_punish_reason_modal',
          components: [new ActionRowBuilder({
            components: [new TextInputBuilder({
              label: lang('modalTextLabel'),
              maxLength: 500,
              customId: 'infoCMds_punish_reason_modal_text',
              style: TextInputStyle.Short
            })]
          })]
        });

        this.showModal(modal);
        const submit = await this.awaitModalSubmit({ time: 30000 }).catch(() => { });
        if (!submit) return;
        await submit.deferUpdate();

        this.commandName = mode;
        this.options = { getMember: () => item, getString: () => submit.fields.getTextInputValue('infoCMds_punish_reason_modal_text'), getNumber: () => 0 };
        this.editReply = this.followUp;
        lang.__boundArgs__[0].backupPath = `commands.moderation.${mode}`;

        bankick.call(this, lang);
      }

      for (const button of this.message.components[0].components) button.data.disabled = true;
      try { this.message.edit({ components: this.message.components }); } catch { }
    }
  }
};