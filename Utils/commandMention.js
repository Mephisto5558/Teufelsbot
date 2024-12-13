/** @type {import('.').commandMention} */
module.exports = function commandMention(name, id) {
  return `</${name}:${id}>`;
};