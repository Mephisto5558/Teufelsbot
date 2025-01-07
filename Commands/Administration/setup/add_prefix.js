const
  { inlineCode } = require('discord.js'),
  MAX_PREFIXES_PER_GUILD = 2;

module.exports = {
  /** @type {NonNullable<command<'slash'>['options']>[number]['options']} */
  options: [
    {
      name: 'new_prefix',
      type: 'String',
      required: true
    },
    { name: 'case_insensitive', type: 'Boolean' }
  ],

  /** @type {command<'slash'>['run']} */
  async run(lang) {
    const
      prefix = this.options.getString('new_prefix', true),
      db = this.guild.db.config[`${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`] ?? [];

    let prefixInDB = db.find(e => prefix == e.prefix);

    const caseinsensitive = this.options.getBoolean('case_insensitive') ?? prefixInDB?.caseinsensitive ?? false;

    if (!prefixInDB && db.length >= MAX_PREFIXES_PER_GUILD) return this.customReply(lang('limitReached'));

    if (!db.length) await this.guild.updateDB(`config.${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`, [{ prefix, caseinsensitive }]);
    else if (prefixInDB) {
      prefixInDB ??= {};
      prefixInDB.prefix = prefix;
      prefixInDB.caseinsensitive = caseinsensitive;

      if (!db.length) db.push(prefixInDB);
      await this.guild.updateDB(`config.${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`, db);
    }
    else await this.client.db.pushToSet('guildSettings', `${this.guild.id}.config.${this.client.botType == 'dev' ? 'betaBotP' : 'p'}refixes`, { prefix, caseinsensitive });

    return this.customReply(lang('saved', inlineCode(prefix)));
  }
};