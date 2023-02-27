const
  { EmbedBuilder, Colors } = require('discord.js'),
  cooldowns = require('./cooldowns.js'),
  I18nProvider = require('./I18nProvider.js');

module.exports = async function buttonPressHandler(lang) {
  const [feature, id, mode, data, ...args] = this.customId.split('.');
  const cooldown = cooldowns.call(this, { name: `buttonPressEvent.${id || Math.floor(Date.now() / 2e5)}` });
  if (cooldown) return this.reply(I18nProvider.__({ locale: this.guild.localeCode }, 'events.buttonPressOnCooldown', cooldown));

  switch (feature) {
    case 'selfrole': {
      await this.deferReply({ ephemeral: true });
      const successEmbed = new EmbedBuilder({ title: lang('events.selfrole.embedTitle'), color: Colors.Green });
      const errorEmbed = new EmbedBuilder({ title: lang('events.selfrole.embedTitle'), color: Colors.Red });

      let role;
      try { role = await this.guild.roles.fetch(data); }
      catch { return this.editReply({ embeds: [errorEmbed.setDescription(lang('events.selfrole.roleNotFound'))] }); }

      if (!this.member.manageable) return this.editReply({ embeds: [errorEmbed.setDescription(lang('events.selfrole.noPermMember'))] });
      if (role.comparePositionTo(this.guild.members.me.roles.highest) > -1) return this.editReply({ embeds: [errorEmbed.setDescription(lang('events.selfrole.noPermRole', role.id))] });

      let count = parseInt(this.component.label.match(/(\d*)\]$/)?.[1])?.limit({ min: 0 }) || 0;

      switch (mode) {
        case 'add': {
          if (this.member.roles.cache.has(role.id)) return this.editReply({ embeds: [errorEmbed.setDescription(lang('events.selfrole.hasRoleAlready', role.id))] });
          await this.member.roles.add(role);
          if (args.includes('count') && this.component.label) {
            this.component.data.label = this.component.label.replace(/\d*\]$/, `${count + 1}]`);
            this.message.edit({ components: this.message.components });
          }
          return this.editReply({ embeds: [successEmbed.setDescription(lang('events.selfrole.addSuccess', role.id))] });
        }

        case 'remove': {
          if (!this.member.roles.cache.has(role.id)) return this.editReply({ embeds: [errorEmbed.setDescription(lang('events.selfrole.missesRole', role.id))] });
          await this.member.roles.remove(role);
          if (args.includes('count') && this.component.label) {
            this.component.data.label = this.component.label.replace(/\d*\]$/, `${count - 1}]`).limit({ min: 0 });
            this.message.edit({ components: this.message.components });
          }
          return this.editReply({ embeds: [successEmbed.setDescription(lang('events.selfrole.removeSuccess', role.id))] });
        }

        case 'toggle': {
          if (this.member.roles.cache.has(role.id)) {
            await this.member.roles.remove(role);
            this.editReply({ embeds: [successEmbed.setDescription(lang('events.selfrole.removeSuccess', role.id))] });
            count--;
          }
          else {
            await this.member.roles.add(role);
            this.editReply({ embeds: [successEmbed.setDescription(lang('events.selfrole.addSuccess', role.id))] });
            count++;
          }

          if (args.includes('count') && this.component.label) {
            this.component.data.label = this.component.label.replace(/\d*\]$/, `${count}]`);
            this.message.edit({ components: this.message.components });
          }
          return;
        }
      }
    }
  }
};