const
  { EmbedBuilder, Colors } = require('discord.js'),
  { msInSecond } = require('./timeFormatter'),
  cooldowns = require('./cooldowns.js'),

  /** @type {import('.').errorHandler} */
  errorHandler = require('./errorHandler.js'),
  handlers = require('./componentHandler/');

/** @type {import('.').componentHandler} */
module.exports = async function messageComponentHandler(lang) {
  const
    [feature, id, mode, data, ...args] = this.customId.split('.'),
    cooldown = cooldowns.call(this, `buttonPressEvent.${this.message.id}`, { user: msInSecond }),
    command = this.client.slashCommands.get(feature) ?? this.client.prefixCommands.get(feature) ?? { name: feature, aliasOf: undefined },
    disabledList = this.guild?.db.config.commands?.[command.aliasOf ?? command.name]?.disabled ?? {};

  let err;
  if (disabledList.users?.includes(this.user.id)) err = 'notAllowed.user';
  else if (disabledList.channels?.includes(this.channel.id)) err = 'notAllowed.channel';
  else if (disabledList.roles && this.member.roles.cache.some(e => disabledList.roles.includes(e.id))) err = 'notAllowed.role';
  else if (command.category == 'nsfw' && !this.channel.nsfw) err = 'nsfw';
  else if (cooldown) err = 'events.interaction.buttonOnCooldown';

  if (err) {
    const embed = new EmbedBuilder({ description: lang(err, cooldown), color: Colors.Red });
    return this.reply({ embeds: [embed], ephemeral: true });
  }

  try { if (handlers[feature]) return await handlers[feature].call(this, lang, id, mode, data, args); }
  catch (err) { return errorHandler.call(this.client, err, this, lang); }
};