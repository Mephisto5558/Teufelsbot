import type GiveawaySubcommand from './index';
import type { GuildMember } from 'discord.js';

import { CommandOption, OptionType } from '@mephisto5558/command';
import { timeValidator } from '#utils';


/** @type {GiveawaySubcommand} */
export default new CommandOption({
  name: 'edit',
  type: OptionType.Subcommand,
  options: [
    {
      name: 'id',
      type: OptionType.String,
      required: true
    },
    {
      name: 'add_time',
      type: OptionType.String,
      autocompleteOptions: timeValidator,
      strictAutocomplete: true
    },
    {
      name: 'winner_count',
      type: OptionType.Integer,
      minValue: 1
    },
    { name: 'prize', type: OptionType.String },
    { name: 'thumbnail', type: OptionType.String },
    { name: 'image', type: OptionType.String },
    { name: 'exempt_members', type: OptionType.String },
    { name: 'required_roles', type: OptionType.String },
    { name: 'bonus_entries', type: OptionType.String }
  ],

  async run(lang, { components, bonusEntries, requiredRoles, disallowedMembers, duration, giveawayId }) {
    const editOptions = {
      addTime: duration,
      newBonusEntries: {},
      newWinnerCount: this.options.getInteger('winner_count'),
      newPrize: this.options.getString('prize'),
      newThumbnail: this.options.getString('thumbnail'),
      newImage: this.options.getString('image')
    };

    if (requiredRoles?.length || disallowedMembers?.length) {
    /** @param {GuildMember} member */
      editOptions.newExemptMembers = member => disallowedMembers.includes(member.id) || !member.roles.cache.some(e => requiredRoles?.includes(e.id));
    }

    if (bonusEntries?.__count__) {
      /** @param {GuildMember} member */
      editOptions.newBonusEntries.bonus = member => bonusEntries[member.id];
    }

    const data = await this.client.giveawaysManager.edit(giveawayId, editOptions);
    components[0].components[0].data.url = data.messageURL;

    return this.editReply({ content: lang('edited'), components });
  }
});