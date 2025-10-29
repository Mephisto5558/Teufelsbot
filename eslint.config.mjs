import config, { getModifiedRule } from '@mephisto5558/eslint-config';

/* eslint-disable-next-line @typescript-eslint/no-unsafe-call, @typescript-eslint/no-unsafe-member-access */
config.find(e => e.rules && 'no-underscore-dangle' in e.rules)?.rules['no-underscore-dangle'][1]?.allow
  ?.push?.('__count__', '_log', '_logToConsole', '_logToFile'); // Object#count, Logger

/**
 * @type {typeof config}
 * This config lists all rules from every plugin it uses. */
export default [
  ...config,
  {
    ignores: ['./Locales/!(en)/**', './Utils/DiscordAPIErrorCodes.json']
  },
  {
    name: 'templates',
    files: ['Templates/*.{js,ts}'],
    rules: {
      '@typescript-eslint/no-empty-function': 'off',
      '@typescript-eslint/no-unused-vars': 'off'
    }
  },
  {
    name: 'overwrite:scripts',
    files: ['**/*.{js,ts}'],
    languageOptions: {
      globals: {
        // promisified setTimeout
        sleep: 'readonly',
        log: 'readonly',
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
    name: 'overwrite:locales/commands',
    files: ['./Locales/*/commands/*.json'],
    rules: {
      'jsonc/key-name-casing': getModifiedRule(config, 'jsonc/key-name-casing', {
        snake_case: true /* eslint-disable-line camelcase */
      }),
      'jsonc/sort-keys': getModifiedRule(config, 'jsonc/sort-keys',
        {
          pathPattern: '^$',
          order: [
            'categoryName',
            'categoryDescription',
            { order: { type: 'asc' } }
          ]
        },
        {
          pathPattern: '^(?!categoryName|categoryDescription).+$',
          order: [
            'description',
            'usage',
            'options',
            { order: { type: 'asc' } }
          ]
        },
        {
          pathPattern: String.raw`^(?!categoryName|categoryDescription).+\.options.*$`,
          order: [
            'description',
            'options',
            'choices',
            { order: { type: 'asc' } }
          ]
        },
        {
          pathPattern: String.raw`.*\.usage$`,
          order: [
            'usage',
            'examples'
          ]
        })
    }
  },
  {
    name: 'overwrite:dashboard-settings',
    files: ['./Website/DashboardSettings/*/_index.json'],
    rules: {
      'jsonc/sort-keys': getModifiedRule(config, 'jsonc/sort-keys', {
        pathPattern: '^$',
        order: [
          'id',
          'name',
          'description',
          'position',
          { order: { type: 'asc' } }
        ]
      })
    }
      ...Array.isArray(sortKeysRule)
        ? {
            'jsonc/sort-keys': [
              sortKeysRule[0],
              {
                pathPattern: '^$',
                order: [
                  'id',
                  'name',
                  'description',
                  'position',
                  { order: { type: 'asc' } }
                ]
              }
            ]
          }
        : {}
    }
  }
];