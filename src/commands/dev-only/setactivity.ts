import { ActivityType, inlineCode } from 'discord.js';
import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';

/** @type {Record<Lowercase<keyof typeof ActivityType>, ActivityType>} */
const ActivityTypes = Object.fromEntries(Object.entries(ActivityType).map(([k, v]) => [k.toLowerCase(), v]));


export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,
  options: [
    {
      name: 'type',
      type: OptionType.String,
      /* eslint-disable-next-line unicorn/prefer-number-properties -- different use case */
      choices: Object.keys(ActivityType).filter(isNaN).map(e => e.toLowerCase())
    },
    { name: 'activity', type: OptionType.String }
  ],

  async run(lang) {
    const

      /** @type {Lowercase<keyof typeof ActivityType>} */
      activityType = this.args[0]?.toLowerCase(),
      activity = {
        type: ActivityTypes[activityType],
        name: this.args.slice(1).join(' ')
      };

    if (!activity.name) {
      await this.client.db.delete('botSettings', 'activity');
      return this.customReply(lang('reset'));
    }

    if (typeof activity.type == 'string') activity.type = ActivityType[activity.type];

    this.client.user.setActivity(activity);
    await this.client.db.update('botSettings', 'activity', activity);

    return this.customReply(lang('set', { name: inlineCode(activity.name), type: inlineCode(ActivityType[activity.type]) }));
  }
});