import config, { plugins } from '@mephisto5558/eslint-config';

export default [
  ...config,
  {
    ignores: ['Templates/**']
  },
  {
    name: 'overwrite',
    files: ['**/*.js', '**/*.ts'],
    languageOptions: {
      globals: {
        // promisified setTimeout
        sleep: 'readonly',
        log: 'readonly',
        getEmoji: 'readonly',
        SlashCommand: 'readonly',
        PrefixCommand: 'readonly',
        MixedCommand: 'readonly',
        CommandOptions: 'readonly',
        // [TYPES] see globals.d.ts
        GenericFunction: 'writable',
        Snowflake: 'writable',
        Database: 'writable',
        lang: 'writable',
        langUNF: 'writable',
        slashCommand: 'writable',
        prefixCommand: 'writable',
        command: 'writable',
        commandOptions: 'writable',
        bBoundFunction: 'writable',
        Client: 'writable',
        Message: 'writable',
        PartialMessage: 'writable',
        Interaction: 'writable',
        GuildInteraction: 'writable',
        DMInteraction: 'writable'
      }
    },
    plugins,
    rules: {
      "sonarjs/no-implicit-dependencies": "off" // Does not support package.json "imports" field
    }
  }
];