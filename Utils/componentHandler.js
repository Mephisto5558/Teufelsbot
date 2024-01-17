const
  { EmbedBuilder, Colors } = require('discord.js'),
  cooldowns = require('./cooldowns.js'),
  handlers = require('./componentHandler/');

/**@this import('discord.js').MessageComponentInteraction @param {lang}lang*/
module.exports = async function MessageComponentHandler(lang) {
  const
    [feature, id, mode, data, ...args] = this.customId.split('.'),
    /**@type {number}*/
    cooldown = cooldowns.call(this, { name: `buttonPressEvent.${this.message.id}`, cooldowns: { user: 1000 } }),
    command = this.client.slashCommands.get(feature) ?? this.client.prefixCommands.get(feature) ?? { name: feature },
    disabledList = this.guild?.db.commandSettings?.[command.aliasOf || command.name]?.disabled || {};

  let err;
  if (disabledList.members?.includes(this.user.id)) err = 'notAllowed.member';
  else if (disabledList.channels?.includes(this.channel.id)) err = 'notAllowed.channel';
  else if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) err = 'notAllowed.role';
  else if (command.category?.toLowerCase() == 'nsfw' && !this.channel.nsfw) err = 'nsfw';
  else if (cooldown) err = 'events.interaction.buttonOnCooldown';

  if (err) {
    const embed = new EmbedBuilder({ description: lang(err, cooldown), color: Colors.Red });
    return this.reply({ embeds: [embed], ephemeral: true });
  }

  if (handlers[feature]) return handlers[feature].call(this, lang, id, mode, data, args);
};
