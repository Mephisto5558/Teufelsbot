module.exports = {
  name: 'ban',
  aliases: { prefix: [], slash: [] },
  permissions: { client: ['BanMembers'], user: ['BanMembers'] },
  cooldowns: { guild: 0, user: 100 },
  category: 'Moderation',
  slashCommand: true,
  prefixCommand: false,
  options: [
    {
      name: 'targets',
      type: 'String',
      required: true
    },
    {
      name: 'reason',
      type: 'String',
      required: true
    },
    {
      name: 'delete_days_of_messages',
      type: 'Number',
      minValue: 1,
      maxValue: 7
    }
    /* {
      name: 'duration',
      type: 'Number',
      autocomplete: true,
      autocompleteOptions: function () { return this.client.functions.timeValidator(this.focused.value); } }
    */
  ],

  run: require('../../Functions/private/bankick.js')
};