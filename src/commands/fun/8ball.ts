const
  { AllContexts, Command, CommandType, OptionType } = require('@mephisto5558/command'),
  { seededHash } = require('#utils');

module.exports = new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  contexts: AllContexts,
  options: [{
    name: 'question',
    type: OptionType.String,
    required: true
  }],

  async run(lang) {
    const
      /** @type {string} */ input = this.options?.getString('question', true) ?? this.content,
      responseList = lang.array__('responseList');

    return this.customReply(responseList[
      seededHash(input.toLowerCase(), Number.parseInt(this.user.id, 10)
      ^ seededHash(Temporal.Now.plainDateISO().toString())) % responseList.length
    ]);
  }
});