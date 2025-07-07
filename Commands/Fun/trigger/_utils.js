/** @type {import('.').findTriggerId} */
const findTriggerId = (query, data) => query in data
  ? query
  : Object.entries(data).find((/** @type {import('.').triggersArray} */ [, { trigger }]) => trigger.toLowerCase() == query.toLowerCase())?.[0];

/**
 * @type {import('.').triggerQuery}
 * @this {ThisParameterType<import('.').triggerQuery>} */
function triggerQuery() {
  return Object.entries(this.guild.db.triggers ?? {}).reduce((acc, [k, v]) => {
    acc[0].push(v.trigger);
    acc[1].push(k);

    return acc;
  }, [[], []]).flat();
}

module.exports = { findTriggerId, triggerQuery };