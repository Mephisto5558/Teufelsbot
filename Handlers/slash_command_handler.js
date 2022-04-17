module.exports = (client) => {
  const fs = require('fs');
  let slashCommandCount = 0;
  
  fs.readdirSync("./Commands").forEach(cmd => {
    let commands = fs.readdirSync(`./Commands/${cmd}/`).filter((file) => file.endsWith(".js")).forEach((file) => {
      let pull = require(`../Commands/${cmd}/${file}`);
      if(pull.slashCommand) {
        client.slashCommandList.push(pull)
        console.log(`Loaded Slash Command ${pull.name}`)
        slashCommandCount++
      }
    })
  });
  console.log(`Loaded ${slashCommandCount} Slash commands\n`)
  return slashCommandCount;
}