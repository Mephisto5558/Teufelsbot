/**@this {{}}@param {string}key@returns {{}}object with found entries*/
module.exports = function findAllEntries(key) {
  const entryList = {};
  for (const entry of Object.keys(this)) {
    if (entry == key) entryList[key] = this[key];
    else if (typeof this[entry] === 'object') {
      const data = findAllEntries.call(this[entry], key);
      if (Object.keys(data).length) entryList[entry] = data;
    }
  }
  return entryList;
};