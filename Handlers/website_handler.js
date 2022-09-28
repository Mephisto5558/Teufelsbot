const
  { readdirSync } = require('fs'),
  app = require('express')(),
  rateLimit = require('express-rate-limit').default,
  I18nProvider = require('../Functions/private/I18nProvider.js'),
  lang = I18nProvider.__.bind(I18nProvider, { locale: 'en', undefinedNotFound: true });

async function getCommands() {
  const categoryCommandList = [];

  for (const subFolder of getDirectoriesSync('./Commands')) {
    if (subFolder.toLowerCase() == 'owner-only') continue;
    const commandList = [];

    for (
      const cmd of readdirSync(`./Commands/${subFolder}`)
        .map(e => e.endsWith('.js') ? require(`../Commands/${subFolder}/${e}`) : null)
        .filter(e => e?.name && !e.hideInHelp && !e.disabled && (!e.beta ?? this.botType == 'dev') && e.category.toLowerCase() != 'owner-only')
    ) {
      commandList.push({
        commandName: cmd.name,
        commandUsage:
          (cmd.slashCommand ? 'SLASH Command: Look at the option descriptions.\n' : '') +
          ((cmd.usage || lang(`commands.${subFolder}.${cmd.name}.usage`))?.replace(/slash command:/gi, '') ?? '') || 'No information found',
        commandDescription: cmd.description || lang(`commands.${subFolder}.${cmd.name}.description`) || 'No information found',
        commandAlias:
          (cmd.aliases.prefix.length ? `Prefix: ${cmd.aliases.prefix.join(', ')}\n` : '') +
          (cmd.aliases.slash.length ? `Slash: ${cmd.aliases.slash.join(', ')}` : '') || lang('global.none')
      });
    }

    categoryCommandList.push({
      category: subFolder,
      subTitle: '',
      aliasesDisabled: false,
      list: commandList.map(e => Object.fromEntries(Object.entries(e).map(([k, v]) => [k, v.trim().replaceAll('\n', '<br>&nbsp')])))
    });
  }

  return categoryCommandList.sort((a, b) => a.category.toLowerCase() == 'others' ? 1 : b.list.length - a.list.length);
}
const commands = getCommands();

module.exports = function websiteHandler() {
  app
    .disable('x-powered-by')
    .use(rateLimit({
      windowMs: 1000,
      max: 10, // 10 per sec
      message: '<body style="background-color:#000; color: #ff0000"><p style="text-align: center;top: 50%;position: relative;font-size: 40;">Sorry, you have been ratelimited!</p></body>'
    }))
    .get('/', (_, res) => res.sendStatus(200))
    .get('/commands', async (req, res) => {
      if (req.query.key != this.keys.WebsiteKey) return res.status(403).send('You need to provide a valid "key" url parameter to access this information.');
      return res.send(req.query.fetch ? await getCommands() : commands);
    })
    .listen(process.env.PORT ?? process.env.SERVER_PORT ?? 8000);
};