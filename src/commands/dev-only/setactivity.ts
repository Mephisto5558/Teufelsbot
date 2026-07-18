import { ActivityType, inlineCode } from 'discord.js';
import { AllContexts, Command, CommandType, OptionType } from '@mephisto5558/command';


const ActivityTypes = Object.fromEntries(Object.entries(ActivityType).map(([k, v]) => [k.toLowerCase(), v]));


export default new Command({
  types: [CommandType.Prefix],
  contexts: AllContexts,
  options: [
    {
      name: 'type',
      type: OptionType.String,
      choices: Object.keys(ActivityType).map(e => e.toLowerCase())
    },
    { name: 'activity', type: OptionType.String }
  ],

  async run(lang) {
    const
      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- ensured by options */
      activityType = (this.args[0] as keyof typeof ActivityType).toLowerCase(),
      activity = {
        type: ActivityTypes[activityType],
        name: this.args.slice(1).join(' ')
      };

    if (!activity.name) {
      await this.client.db.delete('botSettings', 'activity');
      return this.customReply(lang('reset'));
    }

    this.client.user.setActivity(activity);
    await this.client.db.update('botSettings', 'activity', activity);

    return this.customReply(lang('set', { name: inlineCode(activity.name), type: inlineCode(ActivityType[activity.type]) }));
  }
});