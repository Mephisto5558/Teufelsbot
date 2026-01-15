/** @import { ClientEvents } from 'discord.js' */

const { commandExecutionWrapper, commandTypes } = require('@mephisto5558/command');

/** @this {ClientEvents['messageCreate'][0]} */
module.exports = async function messageCreate() {
  if (this.client.settings.blacklist?.includes(this.user.id)) return;

  if (this.botType != 'dev' && this.inGuild()) {
    if (this.guild.db.config.autopublish && this.crosspostable) void this.crosspost();

    const mentions = [...this.mentions.users.keys(), ...this.mentions.roles.flatMap(e => e.members).keys()]
      .filter(e => e != this.user.id); // repliedUser is in mentions.users
    if (mentions.length) {
      void this.guild.updateDB('lastMentions', mentions.reduce((acc, e) => (
        { ...acc, [e]: { content: this.content, url: this.url, author: this.author, channel: this.channel.id, createdAt: this.createdAt } }
      ), this.guild.db.lastMentions ?? {}));
    }
  }

  if (this.user.bot) return;
  if (!this.commandName) return this.inGuild() ? this.runMessages() : undefined;

  const
    command = this.client.prefixCommands.get(this.commandName),
    lang = this.client.i18n.getTranslator({
      locale: this.inGuild() ? this.guild.db.config.lang ?? this.guild.localeCode : this.user.localeCode
    });

  return commandExecutionWrapper.call(this, command, commandTypes.prefix, lang);
};