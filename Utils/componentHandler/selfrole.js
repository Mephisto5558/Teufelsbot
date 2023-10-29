const { EmbedBuilder, Colors } = require('discord.js');

/** this.customId: `selfrole.{Date.now()}.<mode>.<roleId>`
 * @deprecated new selfroles can no longer be created
 * @this import('discord.js').ButtonInteraction @param {lang}lang @param {string}mode @param {string}roleId @param {string[]}args*/
module.exports = async function selfrole(lang, mode, roleId, args) {
  await this.deferReply({ ephemeral: true });

  lang.__boundArgs__[0].backupPath = 'events.interaction.selfrole';

  const
    successEmbed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Green }),
    errorEmbed = new EmbedBuilder({ title: lang('embedTitle'), color: Colors.Red }),
    role = await this.guild.roles.fetch(roleId).catch(() => { });

  if (!role) return this.editReply({ embeds: [errorEmbed.setDescription(lang('roleNotFound'))] });
  if (!this.member.manageable) return this.editReply({ embeds: [errorEmbed.setDescription(lang('noPermMember'))] });
  if (role.comparePositionTo(this.guild.members.me.roles.highest) > -1) return this.editReply({ embeds: [errorEmbed.setDescription(lang('noPermRole', role.id))] });

  let count = parseInt(this.component.label.match(/(\d*)\]$/)?.[1])?.limit({ min: 0 }) || 0;

  switch (mode) {
    case 'add': {
      if (this.member.roles.cache.has(role.id)) return this.editReply({ embeds: [errorEmbed.setDescription(lang('hasRoleAlready', role.id))] });

      await this.member.roles.add(role);
      log.setType('selfrole').debug(`Added role ${role} to member ${this.member.id}`).setType();

      if (args.includes('count') && this.component.label) {
        this.component.data.label = this.component.label.replace(/\d*\]$/, `${count + 1}]`);
        this.message.edit({ components: this.message.components });
      }
      return this.editReply({ embeds: [successEmbed.setDescription(lang('addSuccess', role.id))] });
    }

    case 'remove': {
      if (!this.member.roles.cache.has(role.id)) return this.editReply({ embeds: [errorEmbed.setDescription(lang('missesRole', role.id))] });

      await this.member.roles.remove(role);
      log.setType('selfrole').debug(`Removed role ${role} from member ${this.member.id}`).setType();

      if (args.includes('count') && this.component.label) {
        this.component.data.label = this.component.label.replace(/\d*\]$/, `${count - 1}]`).limit({ min: 0 });
        this.message.edit({ components: this.message.components });
      }
      return this.editReply({ embeds: [successEmbed.setDescription(lang('removeSuccess', role.id))] });
    }

    case 'toggle': {
      if (this.member.roles.cache.has(role.id)) {

        await this.member.roles.remove(role);
        log.setType('selfrole').debug(`Removed role ${role} from member ${this.member.id}`).setType();

        this.editReply({ embeds: [successEmbed.setDescription(lang('removeSuccess', role.id))] });
        count--;
      }
      else {
        await this.member.roles.add(role);
        log.setType('selfrole').debug(`Added role ${role} to member ${this.member.id}`).setType();
        
        this.editReply({ embeds: [successEmbed.setDescription(lang('addSuccess', role.id))] });
        count++;
      }

      if (args.includes('count') && this.component.label) {
        this.component.data.label = this.component.label.replace(/\d*\]$/, `${count}]`);
        this.message.edit({ components: this.message.components });
      }
    }
  }
};