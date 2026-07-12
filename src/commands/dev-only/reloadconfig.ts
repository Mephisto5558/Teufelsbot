import { Team } from 'discord.js';
import { resolve } from 'node:path';
import { AllContexts, Command, CommandType } from '@mephisto5558/command';
import { setDefaultConfig, configValidationLoop, validConfig } from '#utils'.configValidator,
import { loadEnv } from '#utils/prototypeRegisterer/client__loadEnvAndDB.js';

const filePath = resolve(process.cwd(), 'config.json');

export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,
  beta: true,

  async run(lang) {
    log.debug(`Reloading config, initiated by user ${this.user.tag}`);

    /* eslint-disable-next-line @typescript-eslint/no-dynamic-delete -- require.cache */
    delete require.cache[filePath];

    const config = setDefaultConfig();
    try { configValidationLoop(config, validConfig, true); }
    catch (rawErr) {
      const err = Error.isError(rawErr) ? rawErr : new Error(rawErr);
      return this.customReply(lang('error', err.message));
    }

    config.devIds.add(this.client.application.owner instanceof Team ? this.client.application.owner.ownerId : this.client.application.owner.id);
    this.client.config = config;

    await loadEnv.call(this.client);
    return this.customReply(lang('success'));
  }
});