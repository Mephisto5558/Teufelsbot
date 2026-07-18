import { Command, CommandType, CooldownType, Permission, PermissionType } from '@mephisto5558/command';

import addPrefix from './add_prefix.ts';
import autopublish from './autopublish.ts';
import birthday from './birthday.ts';
import language from './language.ts';
import logger from './logger.ts';
import removePrefix from './remove_prefix.ts';
import severbackup from './serverbackup.ts';
import setPrefix from './set_prefix.ts';
import toggleCommand from './toggle_command.ts';
import wordcounter from './wordcounter.ts';


export default new Command({
  types: [CommandType.Slash],
  aliases: { [CommandType.Slash]: ['config'] },
  permissions: { [PermissionType.User]: [Permission.ManageGuild] },
  cooldowns: { [CooldownType.User]: '10s' },
  options: [
    toggleCommand,
    language,
    setPrefix,
    addPrefix,
    removePrefix,
    severbackup,
    autopublish,
    logger,
    birthday,
    wordcounter
  ],

  run() { /* Handled by the individual subcommands. */ }
});