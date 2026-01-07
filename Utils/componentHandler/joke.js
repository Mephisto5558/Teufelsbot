/** @import { joke } from '.' */

const { commandExecutionWrapper } = require('@mephisto5558/command');

/** @type {joke} */
module.exports = async function joke(lang, api, type, blacklist, maxLength) {
  this.options = {
    /** @param {string} str */
    /* eslint-disable unicorn/no-null -- Mimicing discord.js behavior */
    getString: str => {
      switch (str) {
        case 'api': return api == 'null' ? null : api;
        case 'type': return type == 'null' ? null : type;
        case 'blacklist': return blacklist == 'null' ? null : blacklist;
        default: return null;
      }
    },
    getInteger: () => maxLength == 'null' ? null : maxLength
    /* eslint-enable unicorn/no-null */
  };

  await this.update({ components: [] });

  return commandExecutionWrapper.call(this, this.client.slashCommands.get('joke'), 'component', lang);
};