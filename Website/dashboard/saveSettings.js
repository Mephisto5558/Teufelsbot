const updated = [];
//Dynamically save, mapped by index and setting id

module.exports = async ({ db, dashboardOptionCount }, guildId, index, setting, data) => {
  updated.push([setting, data, index]);
  if (updated.length < dashboardOptionCount[index]) return;

  const oldData = db.get('guildSettings');
  let newData = oldData;

  for (let entry of updated) {
    const indexes = [...entry[0].matchAll(/[A-Z]/g)].map(a => ({ index: a.index, value: a[0] }));
    entry[0] = entry[0].split('');

    for (const i of indexes) entry[0][i.index] = `":{"${i.value.toLowerCase()}`;

    if (entry[1].embed && !entry[1].content) entry[1].content = ' ';
    if (entry[1].embed && !entry[1].embed.description) entry.embed.description = ' ';

    let json = `{"${entry[2]}": {"${entry[0].join('')}": ${JSON.stringify(entry[1])}`;
    json = json.padEnd(json.length + indexes.length + 2, '}');
    
    newData = newData.merge({ [guildId]: JSON.parse(json) });
  }

  db.set('guildSettings', newData);
  updated.length = 0;
}