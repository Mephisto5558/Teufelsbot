const
  { readdir } = require('fs/promises'),
  app = require('express')(),
  rateLimit = require('express-rate-limit').default,
  { I18nProvider, gitpull, getOwnerOnlyFolders } = require('../Utils'),
  ownerOnlyFolders = getOwnerOnlyFolders(),
  lang = I18nProvider.__.bind(I18nProvider, { locale: 'en', undefinedNotFound: true });

function validate(key, res, WebsiteKey) {
  if (key == WebsiteKey) return true;

  res.status(403).send('You need to provide a valid "key" url parameter to access this information.');
  return false;
}

async function getCommands() {
  const categoryCommandList = [];
  for (const subFolder of await getDirectories('./Commands')) {
    if (ownerOnlyFolders.includes(subFolder.toLowerCase())) continue;

    const commandList = [];
    for (const cmdFile of await readdir(`./Commands/${subFolder}`)) {
      if (!cmdFile.endsWith('.js')) continue;

      const cmd = require(`../Commands/${subFolder}/${cmdFile}`);
      if (!cmd?.name || cmd.disabled) continue;

      commandList.push({
        commandName: cmd.name,
        commandUsage:
          (cmd.slashCommand ? 'SLASH Command: Look at the option descriptions.\n' : '') +
          (lang(`commands.${subFolder.toLowerCase()}.${cmd.name}.usage.usage`)?.replace(/slash command:/gi, '') ?? '') || 'No information found',
        commandDescription: cmd.description || lang(`commands.${subFolder.toLowerCase()}.${cmd.name}.description`) || 'No information found',
        commandAlias:
          (cmd.aliases?.prefix?.length ? `Prefix: ${cmd.aliases.prefix.join(', ')}\n` : '') +
          (cmd.aliases?.slash?.length ? `Slash: ${cmd.aliases.slash.join(', ')}` : '') || lang('global.none')
      });
    }

    categoryCommandList.push({
      category: subFolder,
      subTitle: '',
      aliasesDisabled: !commandList.find(e => e.commandAlias),
      list: commandList.map(e => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v.trim().replaceAll('\n', '<br>&nbsp')])))
    });
  }

  return categoryCommandList.sort((a, b) => a.category.toLowerCase() == 'others' ? 1 : b.list.length - a.list.length);
}
const commands = getCommands();

/**@this Client*/
module.exports = async function websiteHandler() {
  while (process.argv.some(e => e == 'isChild=true')) await sleep(500); //Waiting for slash command handler to finish so parent process ends to free the port

  app
    .disable('x-powered-by')
    .use(rateLimit({
      windowMs: 1000,
      max: 10, // 10 per sec
      message: '<body style="background-color:#000; color:#ff0000"><p style="text-align:center;top:50%;position:relative;font-size:40;">Sorry, you have been ratelimited!</p></body>'
    }))
    .all('*', async (req, res) => {
      switch (req.path) {
        case '/commands': {
          if (validate(req.query.key, res, this.keys.WebsiteKey)) res.send(await (req.query.fetch ? getCommands() : commands));
          return;
        }
        case '/reloadDB': {
          if (!validate(req.query.key, res, this.keys.WebsiteKey)) return;
          await this.db.fetch(req.query.db);
          return res.sendStatus(200);
        }
        case '/git/pull': {
          await gitpull();
          return res.send('OK');
        }
        case '/': return res.sendStatus(200);
        default: res.sendStatus(404);
      }
    })
    .listen(process.env.PORT ?? process.env.SERVER_PORT ?? 8000);
};
