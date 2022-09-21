const updated = [];
//Dynamically save, mapped by index and setting id

module.exports = async (guildId, index, setting, newData) => {
  updated.push([setting, newData, index]);
  if (updated.length < this.dashboardOptionCount[index]) return;

  let data = this.db.get('guildSettings');

  for (let entry of updated) {
    const indexes = [...entry[0].matchAll(/[A-Z]/g)].map(a => ({ index: a.index, value: a[0] }));
    entry[0] = entry[0].split('');

    for (const i of indexes) entry[0][i.index] = `":{"${i.value.toLowerCase()}`;

    if (entry[1].embed && !entry[1].content) entry[1].content = ' ';
    if (entry[1].embed && !entry[1].embed.description) entry.embed.description = ' ';

    let json = `{"${entry[2]}": {"${entry[0].join('')}": ${JSON.stringify(entry[1])}`;
    json = json.padEnd(json.length + indexes.length + 2, '}');

    data = data.fMerge({ [guildId]: JSON.parse(json) });
  }

  this.db.set('guildSettings', data);
  updated.length = 0;
}