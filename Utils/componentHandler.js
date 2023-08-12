const
  { EmbedBuilder, Colors } = require('discord.js'),
  cooldowns = require('./cooldowns.js'),
  handlers = require('./componentHandler/');

/**@this {import('discord.js').MessageComponentInteraction}*/
module.exports = async function MessageComponentHandler(lang) {
  const
    [feature, id, mode, data, ...args] = this.customId.split('.'),
    cooldown = cooldowns.call(this, { name: `buttonPressEvent.${this.message.id}`, cooldowns: { user: 1000 } }),
    command = this.client.slashCommands.get(feature) ?? this.client.prefixCommands.get(feature) ?? { name: feature },
    errorEmbed = new EmbedBuilder({ color: Colors.Red }),
    disabledList = this.guild.db.commandSettings?.[command.aliasOf || command.name]?.disabled || {};

  if (disabledList.members && disabledList.members.includes(this.user.id)) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.member'))], ephemeral: true });
  if (disabledList.channels && disabledList.channels.includes(this.channel.id)) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.channel'))], ephemeral: true });
  if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.notAllowed.role'))], ephemeral: true });
  if (command.category?.toLowerCase() == 'nsfw' && !this.channel.nsfw) return this.reply({ embeds: [errorEmbed.setDescription(lang('events.nsfwCommand'))], ephemeral: true });
  if (cooldown) return this.reply({ content: lang('events.buttonPressOnCooldown', cooldown), ephemeral: true });

  if (handlers[feature]) return handlers[feature].call(this, lang, id, mode, data, args);
};