const
  { afk: { nicknamePrefix, getAfkStatus, listAfkStatuses, setAfkStatus }, toMs: { secToMs } } = require('#Utils'),
  maxAllowedAFKMsgLength = 1000;

/** @type {command<'both', false>} */
module.exports = {
  cooldowns: { user: secToMs(5) }, /* eslint-disable-line @typescript-eslint/no-magic-numbers*/
  slashCommand: true,
  prefixCommand: true,
  dmPermission: true,
  options: [
    {
      name: 'set',
      type: 'Subcommand',
      options: [
        {
          name: 'message',
          type: 'String',
          maxLength: maxAllowedAFKMsgLength
        },
        { name: 'global', type: 'Boolean' }
      ]
    },
    {
      name: 'get',
      type: 'Subcommand',
      options: [{ name: 'target', type: 'User' }]
    }
  ],

  run(lang) {
    if (this.options?.getSubcommand() == 'get') {
      const target = this.inGuild() ? this.options.getMember('target') : this.options.getUser('target') ?? this.user;
      if (target) return getAfkStatus.call(this, target, lang);

      return listAfkStatuses.call(this, lang);
    }

    const global = this.options?.getBoolean('global') ?? this.args?.[0] == 'global';
    return setAfkStatus.call(this, lang, global, this.options?.getString('message') ?? this.content?.slice(global ? nicknamePrefix.length + 1 : 0, maxAllowedAFKMsgLength));
  }
};