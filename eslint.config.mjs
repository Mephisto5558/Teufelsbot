import config from '@mephisto5558/eslint-config';

/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
config[0].rules?.['no-underscore-dangle']?.[1]?.allow?.push?.('__count__', '_log', '_logToConsole', '_logToFile'); // Object#count, Logger

/**
 * @type {import('@mephisto5558/eslint-config')['default']}
 * This config lists all rules from every plugin it uses. */
export default [
  ...config,
  {
    name: 'templates',
    files: ['Templates/*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
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
        slashCommand: 'writable',
        prefixCommand: 'writable',
        command: 'writable',
        commandOptions: 'writable',
        Client: 'writable',
        Message: 'writable',
        PartialMessage: 'writable',
        Interaction: 'writable',
        GuildInteraction: 'writable',
        DMInteraction: 'writable'
      }
    }
  },
  {
    name: 'overwrite:js',
    files: ['**/*.js'],
    rules: {
      // pain, needs TODO:
      '@typescript-eslint/no-unsafe-argument': 'off',
      '@typescript-eslint/no-unsafe-member-access': 'off'
    }
  }
];