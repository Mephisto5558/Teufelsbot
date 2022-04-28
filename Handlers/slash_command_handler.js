const fs = require('fs');

module.exports = client => {
  let slashCommandCount = 0;

  fs.readdirSync("./Commands").forEach(subFolder => {
    fs.readdirSync(`./Commands/${subFolder}/`).filter(file => file.endsWith(".js")).forEach(file => {
      let pull = require(`../Commands/${subFolder}/${file}`);
      if (!pull.slashCommand) return;
      client.slashCommandList.push(pull)
      console.log(`Loaded Slash Command ${pull.name}`)
      slashCommandCount++
    })
  });

  console.log(`Loaded ${slashCommandCount} Slash commands\n`);
}