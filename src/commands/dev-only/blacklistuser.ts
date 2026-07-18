import { inlineCode } from 'discord.js';
import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';
import { constants, getTargetMembers } from '#utils';

import type { FeatureRequest } from '@mephisto5558/bot-website';


export default new Command({
  types: [CommandType.Prefix],
  usage: { examples: '12345678901234568' },
  aliases: { [CommandType.Prefix]: ['blacklist'] },
  contexts: AllContexts,
  options: [{
    name: 'target',
    type: OptionType.String,
    required: true
  }],
  beta: true,

  async run(lang) {
    const target = getTargetMembers(this, [{ returnUser: true }])?.id;
    if (!target) return this.reply(lang('global.unknownUser'));

    if (this.args[0] == 'off') {
      if (!this.client.settings.blacklist?.includes(target)) return this.customReply(lang('notFound'));

      await this.client.db.update('botSettings', 'blacklist', this.client.settings.blacklist.filter(e => e != target));
      return this.customReply(lang('removed', inlineCode(target)));
    }

    if (this.client.config.devIds.has(target)) return this.customReply(lang('cantBlacklistDev'));

    await this.client.db.pushToSet('botSettings', 'blacklist', target);

    if (this.client.webServer) {
      const requests = (await this.client.webServer.voteSystem.fetchAll()).reduce<FeatureRequest[]>((acc, e) => {
        if (!e.pending && e.id.split('_', 1)[0] == target) acc.push({ ...e, pending: true });
        return acc;
      }, []);

      if (requests.length) {
        const result = await this.client.webServer.voteSystem.update(requests, this.client.user.id);
        if (!('success' in result && result.success)) throw new Error(JSON.stringify(result, undefined, constants.JSON_SPACES));
      }
    }

    return this.customReply(lang('saved', inlineCode(target)));
  }
});