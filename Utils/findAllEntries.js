/**@this {{}}@param {string}key@returns {{}}object with found entries*/
module.exports = function findAllEntries(key, entryList = {}) {
  if (key in this) entryList = { ...entryList, ...this[key] };
  if (`${{}}` == this) for (const entry of Object.keys(this).filter(e => e != key)) {
    const data = findAllEntries.call(this[entry], key, entryList[entry]);
    if (Object.keys(data || {}).length) entryList[entry] = data;
  }
  return entryList;
};