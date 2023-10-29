/**@param {object}obj @param {string}key @returns object with found entries or undefined if no obj or no key has been provided*/
module.exports = function findAllEntries(obj, key) {
  if (!obj || !key) return;
  let counter = 0;
  const entryList = {};
  const findEntries = obj => {
    if (counter++ > 1000) return;
    for (const [oKey, oVal] of Object.entries(obj)) {
      if (oKey == key) entryList[key] = oVal;
      else if (typeof oVal === 'object') {
        const data = findAllEntries(oVal, key);
        if (Object.keys(data).length) entryList[oKey] = data;
      }
    }
  };

  findEntries(obj);
  return entryList;
};