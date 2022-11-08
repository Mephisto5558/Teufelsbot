module.exports = {
  name: 'ban',
  permissions: { client: ['BanMembers'], user: ['BanMembers'] },
  cooldowns: { user: 100 },
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
      autocompleteOptions: function () { return timeValidator(this.focused.value); } }
    */
  ],

  run: require('../../Utils/bankick.js')
};