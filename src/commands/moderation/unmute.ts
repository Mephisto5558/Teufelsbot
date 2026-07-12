import { userMention } from 'discord.js';
import { Command, CommandType, CooldownType, OptionType, Permission, PermissionType } from '@mephisto5558/command';
import { checkTargetManageable } from '#utils';

export default new Command({
  types: [CommandType.Slash],
  permissions: { [PermissionType.Client]: [Permission.MuteMembers], [PermissionType.User]: [Permission.MuteMembers] },
  cooldowns: { [CooldownType.User]: '100ms' },
  options: [
    {
      name: 'target',
      type: OptionType.User,
      required: true
    },
    { name: 'reason', type: OptionType.String }
  ],

  async run(lang) {
    const
      target = this.options.getMember('target'),
      reason = this.options.getString('reason') ?? lang('noReason');

    if (!target) return this.editReply(lang('notFound'));
    if (!target.isCommunicationDisabled()) return this.editReply(lang('notMuted'));

    const err = checkTargetManageable.call(this, target);
    if (err) return this.editReply(lang(err));

    /* eslint-disable-next-line unicorn/no-null -- `null` must be used here. */
    await target.disableCommunicationUntil(null, `${reason} | ${lang('global.modReason', { command: this.commandName, user: this.user.tag })}`);
    return this.editReply(lang('success', userMention(target.user.id)));
  }
});