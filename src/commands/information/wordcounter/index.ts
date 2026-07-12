import { AllContexts, Command, CommandType } from '@mephisto5558/command';

export default new Command({
  types: [CommandType.Slash],
  contexts: AllContexts,
  options: [
    require('./guild'),
    require('./channel'),
    require('./user')
  ],

  run() { /* Handled by the individual subcommands. */ }
});