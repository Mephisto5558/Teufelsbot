const { seededHash } = require('#Utils');

/** @type {command<'both', false>} */
module.exports = {
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [{
    name: 'question',
    type: 'String',
    required: true
  }],

  async run(lang) {
    const
      /** @type {string} */ input = this.options?.getString('question', true) ?? this.content,
      now = new Date(),
      responseList = lang.array__('responseList');

    return this.customReply(responseList[
      seededHash(input.toLowerCase(), Number.parseInt(this.user.id)
      ^ seededHash(`${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`)) % responseList.length
    ]);
  }
};