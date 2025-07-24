/* eslint-disable unicorn/no-null -- Mimicing discord.js behavior */

const { userMention } = require('discord.js');

/** @type {Message['_patch']} */
/* eslint-disable-next-line custom/unbound-method */
const originalPatch = require('discord.js').Message.prototype._patch;

/** @type {import('.')._patch} */
module.exports = function _patch(data, ...rest) {
  if ('content' in data) {
    this.originalContent = data.content;

    const prefixType = this.client.botType == 'dev' ? 'betaBotPrefixes' : 'prefixes';

    let prefixes = this.guild?.db.config[prefixType];
    if (!prefixes?.[0].prefix) prefixes = this.client.defaultSettings.config[prefixType];

    const
      clientUserMention = userMention(this.client.user.id),
      prefixLength = (
        data.content.startsWith(clientUserMention)
          ? clientUserMention
          : prefixes.find(({ prefix, caseinsensitive }) => (caseinsensitive ? data.content.toLowerCase() : data.content)
            .startsWith(caseinsensitive ? prefix.toLowerCase() : prefix))?.prefix
      )?.length ?? 0;

    this.args = data.content.slice(prefixLength).trim().split(/\s+/);
    this.commandName = prefixLength ? this.args.shift().toLowerCase() : null;
  }
  else {
    this.originalContent ??= null;
    this.args = [];
    this.commandName ??= null;
  }

  originalPatch.call(this, data, ...rest);

  if (this.args.length) this.content = this.args.join(' ');
};