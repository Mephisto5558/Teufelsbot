/**@returns {string[]}*/
module.exports = function getOwnerOnlyFolders() {
  return require('../config.json')?.ownerOnlyFolders?.map(e => e?.toLowerCase()) || ['owner-only'];
};