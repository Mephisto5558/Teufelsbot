module.exports = {
  name: '8ball',
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'question',
    type: 'String',
    required: true
  }],

  run: function (lang) { return this.customReply(!this.content && !this.options?.getString('question') ? lang('noQuestion') : lang('responseList')); }
};