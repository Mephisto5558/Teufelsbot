const
  cooldowns = require('./cooldowns.js'),
  handlers = require('./componentHandler/');

/**@this {import('discord.js').MessageComponentInteraction}*/
module.exports = async function MessageComponentHandler(lang) {
  const
    [feature, id, mode, data, ...args] = this.customId.split('.'),
    cooldown = cooldowns.call(this, { name: `buttonPressEvent.${this.message.id}`, cooldowns: { user: 1000 } });

  if (cooldown) return this.reply({ content: lang('events.buttonPressOnCooldown', cooldown), ephemeral: true });
  if (handlers[feature]) return handlers[feature].call(this, lang, id, mode, data, args);
};