/** @import { commandDoneFn } from '@mephisto5558/command' */

const
  { CommandInteraction } = require('discord.js'),
  { commandTypes } = require('@mephisto5558/command');

/** @type {commandDoneFn} */
module.exports = async function updateCommandStats(command) {
  if (!this.client.settings.commandStats[command.name]?.createdAt)
    await this.client.db.update('botSettings', `commandStats.${command.name}.createdAt`, new Date());

  if (this.client.botType != 'dev') {
    const commandType = this instanceof CommandInteraction ? commandTypes.slash : commandTypes.prefix;

    await this.client.db.update(
      'botSettings', `commandStats.${command.name}.${commandType}`,
      (this.client.settings.commandStats[command.name]?.[commandType] ?? 0) + 1
    );
    await this.user.updateDB(`commandStats.${command.name}.${commandType}`, (this.user.db.commandStats?.[command.name]?.[commandType] ?? 0) + 1);
    if (this.inGuild())
      await this.guild.updateDB(`commandStats.${command.name}.${commandType}`, (this.guild.db.commandStats?.[command.name]?.[commandType] ?? 0) + 1);
  }
};