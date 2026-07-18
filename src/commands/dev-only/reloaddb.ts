import { AllContexts, Command, CommandType } from '@mephisto5558/command';


export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,
  beta: true,

  async run(lang) {
    log.debug(`Reloading db, initiated by user ${this.user.tag}`);

    await this.client.db.fetchAll();
    return this.customReply(lang('success'));
  }
});