const data = [];
//Dynamically save, mapped by index and setting id

module.exports = async ({ db, dashboardOptionCount }, { id }, index, setting, newData) => {
  data.push([setting, newData, index]);
  if (data.length < dashboardOptionCount[index]) return;

  let guildData = await db.get('settings');
  for (let entry of data) {
    const indexes = [...entry[0].matchAll(/[A-Z]/g)].map(a => ({ index: a.index, value: a[0] }));
    entry[0] = entry[0].split('');

    for (const i of indexes) entry[0][i.index] = `":{"${i.value.toLowerCase()}`;

    if (entry[1].embed && !entry[1].content) entry[1].content = ' ';
    if (entry[1].embed && !entry[1].embed.description) entry.embed.description = ' ';

    entry = `{"${entry[2]}": {"${entry[0].join('')}": ${JSON.stringify(entry[1])}`;
    entry = entry.padEnd(entry.length + indexes.length + 2, '}');
    
    guildData = Object.merge(guildData, { [id]: JSON.parse(entry) });
  }

  db.set('settings', guildData);
  data.length = 0;
}