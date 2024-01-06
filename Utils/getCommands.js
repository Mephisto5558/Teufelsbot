const
  { readdir } = require('fs/promises'),
  getOwnerOnlyFolders = require('./getOwnerOnlyFolders.js'),
  ownerOnlyFolders = getOwnerOnlyFolders();

/**@param {lang}lang*/
module.exports = async function getCommands(lang) {
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
};