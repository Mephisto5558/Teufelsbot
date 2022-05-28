const
  fs = require('fs'),
  { Client } = require('discord-slash-commands-client'),
  chalk = require('chalk'),
  event = require('../Events/interactionCreate.js'),
  errorColor = chalk.bold.red;

let
  commandCount = 0,
  delCommandCount = 0,
  skipCommandCount = 0,
  commands = [],
  clientCommands = [],
  skip;

function work(option) {
  if(Array.isArray(option.options))
    option.options.forEach(option => { work(option) });

  if(!option.type) return option.type = 1
  
  if(/[A-Z]/.test(option.name)) {
    console.log(errorColor(`${option.name} IS UPPERCASE! UPPERCASE IS INVALID! Fixing.`))
    option.name = option.name.toLowerCase();
  };

  option.type = option.type.toString()
    .replace('SUB_COMMAND_GROUP', 2).replace('SUB_COMMAND', 1)
    .replace('STRING', 3).replace('INTEGER', 4)
    .replace('BOOLEAN', 5).replace('USER', 6)
    .replace('CHANNEL', 7).replace('ROLE', 8)
    .replace('MENTIONABLE', 9).replace('NUMBER', 10)
    .replace('ATTACHMENT', 11)
};

async function validate(input1, input2) {
  if(input1.name == input2.name && input1.description == input2.description) {
    for(i=0; i < input1.options?.length; i++) {
      option1 = input1.options[i];
      option2 = input2.options[i];

      if(option1?.options || option2?.options) {
        if(!await validate(option1.options, option2.options))
          return false;
      }

      if(
        option1.name == option2.name && option1.type == option2.type &&
        option1.description == option2.description &&
        option1.choices == option2.choices &&
        (option1.required || false) == (option2.required || false)
      ) return true;
      else return false;
    }
  }
}

module.exports = async client => {
  const commandClient = new Client(
    client.keys.token,
    client.userID
  );

  clientCommands = await commandClient.getCommands({});

  fs.readdirSync('./Commands').forEach(subFolder => {
    fs.readdirSync(`./Commands/${subFolder}/`).filter(file => file.endsWith('.js')).forEach(file => {

      let command = require(`../Commands/${subFolder}/${file}`);
      if(!command.slashCommand || command.disabled || (client.botType == 'dev' && !command.beta)) return;

      if(Array.isArray(command.options))
        command.options.forEach(option => { work(option) });
      else if(command.options) work(commandOption.options);
      commands.push(command)
      client.slashCommands.set(command.name, command)

    })
  });

  for(let command of commands) {
    for(let clientCommand of clientCommands) {
      if(await validate(command, clientCommand)) {
        client.log(`Skipped Slash Command ${command.name} because of no changes`);
        skip = true;
      }
    }

    clientCommands = clientCommands.filter(entry => entry.name != command.name);

    if(skip) {
      skipCommandCount++;
      continue;
    }

    await commandClient.createCommand({
        name: command.name,
        description: command.description,
        options: command.options
      })
      .then(_ => {
        client.log(`Registered Slash Command ${command.name}`);
        commandCount++
      })
      .catch(err => {
        console.error(errorColor('[Error Handling] :: Unhandled Slash Handler Error/Catch'));
        console.error(err);
        if(err.response.data.errors)
          console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
      });
    if(commands[commandCount + 1]) await client.functions.sleep(10000);
  }

  for(let clientCommand of clientCommands) {
    await commandClient.deleteCommand(clientCommand.id)
    .then(_ => {
      client.log(`Deleted Slash Command ${clientCommand.name}`);
      delCommandCount++
    })
    .catch(err => {
      console.error(errorColor('[Error Handling] :: Unhandled Slash Command Handler Error/Catch'));
      console.error(err);
      if(err.response.data.errors)
        console.error(errorColor(JSON.stringify(err.response.data, null, 2)));
    });

    if(clientCommands[delCommandCount + 1]) await client.functions.sleep(10000);
  }
  
  client.log(`Loaded ${commandCount} Slash commands`);
  client.log(`Skipped ${skipCommandCount} Slash Commands`);
  client.log(`Deleted ${delCommandCount} Slash commands\n`);

  client.on('interactionCreate', event.bind(null, client))
  client.log(`Loaded Event interactionCreate`);
  client.log(`Ready to receive slash commands\n`);

  do {
    await client.functions.sleep(100);
  } while(!client.readyAt)
  
  client.log(`Ready to serve in ${client.channels.cache.size} channels on ${client.guilds.cache.size} servers, for a total of ${client.guilds.cache.map(g => g.memberCount).reduce((a, c) => a + c)} users.\n`);
  console.timeEnd('Starting time')
}