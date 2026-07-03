import { resolveCommandType } from '@mephisto5558/command';

import type { commandDoneFn } from '@mephisto5558/command';

const updateCommandStats: commandDoneFn = async function updateCommandStats(command) {
  if (!this.client.settings.cmdStats[command.name]?.createdAt)
    await this.client.db.update('botSettings', `cmdStats.${command.name}.createdAt`, Temporal.Now.instant());

  if (this.client.botType != 'dev') {
    const commandType = resolveCommandType(this);

    await this.client.db.update(
      'botSettings', `cmdStats.${command.name}.${commandType}`,
      (this.client.settings.cmdStats[command.name]?.[commandType] ?? 0) + 1
    );
    await this.user.updateDB(`cmdStats.${command.name}.${commandType}`, (this.user.db.cmdStats?.[command.name]?.[commandType] ?? 0) + 1);
    if (this.inGuild())
      await this.guild.updateDB(`cmdStats.${command.name}.${commandType}`, (this.guild.db.cmdStats?.[command.name]?.[commandType] ?? 0) + 1);
  }
};
export default updateCommandStats;