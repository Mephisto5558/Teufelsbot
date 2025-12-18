/** @import { getCommands } from '.' */

/** @typedef {{ commandName: string, commandUsage: string, commandDescription: string, commandAlias: string }[]} commandList */

/** @type {getCommands} */
module.exports = function getCommands(lang) {
  const commandList = [...this.slashCommands.values(), ...this.prefixCommands.values()].unique().reduce((
    /** @type {{ category: string, subTitle: '', aliasesDisabled: boolean, list: commandList }[]} */ acc, cmd
  ) => {
    if (this.config.devOnlyFolders.includes(cmd.category) || cmd.disabled || cmd.aliasOf) return acc;

    let category = acc.find(e => e.category == cmd.category);
    if (!category) {
      category = {
        category: cmd.category,
        subTitle: '',
        list: []
      };
      acc.push(category);
    }

    category.list.push({
      commandName: cmd.name,
      commandUsage: (
        /* eslint-disable-next-line @typescript-eslint/restrict-plus-operands -- will be fixed when commands are moved to their own lib */
        (cmd.slashCommand ? lang('others.getCommands.lookAtOptionDesc') : '')
        + (lang(`commands.${cmd.category}.${cmd.name}.usage.usage`)?.replaceAll(/slash command:/gi, '') ?? '') || lang('others.getCommands.noInfo')
      ).trim().replaceAll('\n', '<br>&nbsp'),
      commandDescription: lang(`commands.${cmd.category}.${cmd.name}.description`) ?? cmd.description,
      commandAlias: (
        /* eslint-disable-next-line sonarjs/expression-complexity -- will be fixed when commands are moved to their own lib */
        (cmd.aliases && 'prefix' in cmd.aliases && cmd.aliases.prefix.length ? `Prefix: ${cmd.aliases.prefix.join(', ')}\n` : '')
        + (cmd.aliases && 'slash' in cmd.aliases && cmd.aliases.slash.length ? `Slash: ${cmd.aliases.slash.join(', ')}` : '') || lang('global.none')
      ).trim().replaceAll('\n', '<br>&nbsp')
    });

    return acc;
  }, []);

  commandList.sort((a, b) => a.category == 'others' ? 1 : b.list.length - a.list.length);
  return commandList.map(e => {
    e.category = lang(`commands.${e.category}.categoryName`);
    e.aliasesDisabled = !e.list.some(e => e.commandAlias != lang('global.none'));
    return e;
  });
};