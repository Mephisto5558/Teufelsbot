/** @import { commandMention } from '.' */

/** @type {commandMention} */
module.exports = function commandMention(name, id) {
  return `</${name}:${id}>`;
};