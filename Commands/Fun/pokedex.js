/**
 * @import * as PokeAPI from 'pokedex-promise-v2'
 * @import { Locale } from '@mephisto5558/i18n' */

const
  { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, bold, inlineCode } = require('discord.js'),
  { Command } = require('@mephisto5558/command'),

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- the lib does not document CommonJS imports */
  /** @type {typeof PokeAPI} */ Pokedex = require('pokedex-promise-v2').default,
  { maxPercentage } = require('#Utils').constants,


  DM_TO_CM = 10,
  DM_TO_M = .1,
  HG_TO_G = 100, // Hectogram
  HG_TO_KG = .1,
  GENDER_RATE = 8, // See https://pokeapi.co/docs/v2#pokemonspeciesgender
  pokedex = new Pokedex(),

  /* eslint-disable-next-line jsdoc/no-undefined-types -- false positive */
  /** @type {<T extends string>(str: T) => Capitalize<T>} */
  capitalize = str => str.charAt(0).toUpperCase() + str.slice(1),

  cache = {
    /** @type {Record<PokeAPI.PokemonSpecies['name'], Record<Locale, string>>} */ localNames: {},
    /** @type {string[]} */ autocomplete: [],
    /** @type {Promise<void> | undefined} */ initPromise: undefined,

    fill: async () => {
      if (cache.autocomplete.length) return;

      cache.initPromise ??= (async () => {
        /** @type {PokeAPI.PokemonSpecies[]} */
        const speciesDetails = await pokedex.getResource((await pokedex.getPokemonSpeciesList()).results.map(e => e.url));

        for (const species of speciesDetails)
          cache.localNames[species.name] = Object.fromEntries(species.names.map(e => [e.language.name, e.name.toLowerCase()]));

        cache.autocomplete = Object.entries(cache.localNames).flatMap(([k, v]) => [k, ...Object.values(v)]);
      })();

      return cache.initPromise;
    },

    /** @type {(query: string) => string} */
    findDefaultName: query => (query in cache.localNames
      ? query
      : Object.entries(cache.localNames).find(([, v]) => Object.values(v).includes(query))?.[0] ?? query)
  };

void cache.fill(); // already filling so autocompleteOptions does not time out

/** @param {PokeAPI.Pokemon} pokemon */
async function getEvolutions(pokemon) {
  const

    /** @type {(chain: PokeAPI.Chain) => string[]} */
    getEvolutionNames = chain => [chain.species.name, ...chain.evolves_to.flatMap(getEvolutionNames)],

    /** @type {PokeAPI.PokemonSpecies} *//* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
    species = await pokedex.getResource(pokemon.species.url);

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- will always be a chain */
  return getEvolutionNames((await pokedex.getResource(species.evolution_chain.url)).chain);
}

/**
 * @param {-1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8} genderRate
 * @param {lang} lang */
function getGenderRate(genderRate, lang) {
  switch (genderRate) {
    case -1: return lang('gender.genderless');
    case 0: return lang('gender.male');
    case GENDER_RATE: return lang('gender.female');
    default: {
      const
        male = (1 - genderRate / GENDER_RATE) * maxPercentage,
        female = (genderRate / GENDER_RATE) * maxPercentage;

      return lang('gender.ratios', { female: inlineCode(female), male: inlineCode(male) });
    }
  }
}

module.exports = new Command({
  types: ['slash', 'prefix'],
  usage: { examples: 'Bulbasaur' },
  dmPermission: true,
  options: [{
    name: 'pokémon',
    type: 'String',
    required: true,
    strictAutocomplete: true,
    async autocompleteOptions() {
      await cache.fill();
      return cache.autocomplete;
    }
  }],

  async run(lang) {
    const
      msg = await this.customReply(lang('global.loading', this.client.application.getEmoji('loading'))),
      pokemon = await pokedex.getPokemonByName(cache.findDefaultName((this.options?.getString('pokémon', true) ?? this.args[0]).toLowerCase())),

      /* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment -- Not using `getPokemonSpeciesByName` to better utilize the lib's cache. */
      /** @type {PokeAPI.PokemonSpecies} */ species = await pokedex.getResource(pokemon.species.url),
      localName = cache.localNames[species.name]?.[this.guild?.localeCode ?? this.user.localeCode ?? lang.defaultConfig.defaultLocale],
      height = pokemon.height < DM_TO_CM
        ? `${Number.parseFloat((pokemon.height * DM_TO_CM).toFixed(2))}cm`
        : `${Number.parseFloat((pokemon.height * DM_TO_M).toFixed(2))}m`,
      weight = pokemon.weight < HG_TO_KG
        ? `${Number.parseFloat((pokemon.weight * HG_TO_G).toFixed(2))}g`
        : `${Number.parseFloat((pokemon.weight * HG_TO_KG).toFixed(2))}kg`,

      /** @type {PokeAPI.Generation} *//* eslint-disable-next-line @typescript-eslint/no-unsafe-assignment */
      generationRes = await pokedex.getResource(species.generation.url),
      embed = new EmbedBuilder({
        thumbnail: { url: pokemon.sprites.other.showdown.front_default },
        color: Colors.Blurple,
        footer: {
          text: species.flavor_text_entries
            .findLast(/** @param {PokeAPI.FlavorText & { language: PokeAPI.Name['language'] & { name: Locale } }} e */
              e => e.language.name == (this.guild?.localeCode ?? this.user.localeCode)
            ).flavor_text
            .replaceAll('\f', '\n') // See https://github.com/veekun/pokedex/issues/218#issuecomment-339841781
            .replaceAll('\u00AD\n', '')
            .replaceAll('\u00AD', '')
            .replaceAll(' -\n', ' - ')
            .replaceAll('-\n', '-')
            .replaceAll('\n', ' ')
        },
        author: {
          name: 'PokéDex: ' + (localName == pokemon.name ? capitalize(pokemon.name) : `${capitalize(localName)} (${capitalize(pokemon.name)})`),
          iconURL: pokemon.sprites.other.showdown.front_shiny
        },
        fields: [
          [lang('types'), pokemon.types.map(e => e.type.name).join(', ')],
          [lang('abilities'), pokemon.abilities.map(e => capitalize(e.ability.name)).join(', ')],
          [lang('genderRatio'), getGenderRate(species.gender_rate, lang)],
          [lang('heightWeight'), `${height}, ${weight}`],
          [
            lang('evolutionLine'),
            (await getEvolutions(pokemon)).map(e => (e == pokemon.species.name ? bold(capitalize(e)) : capitalize(e))).join(', ')
          ],
          [
            lang('gen'),
            /* eslint-disable-next-line @typescript-eslint/no-unsafe-enum-comparison -- this is fine */
            generationRes.names.find(e => e.language.name == (this.guild?.localeCode ?? this.user.localeCode))?.name ?? generationRes.name
          ]
        ].map(/** @param {[string, string]} field */ ([k, v]) => ({ name: k, value: v, inline: false }))
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: 'Bulbapedia',
            style: ButtonStyle.Link,
            url: `https://bulbapedia.bulbagarden.net/wiki/${pokemon.name}`
          }),
          new ButtonBuilder({
            label: 'Serebii',
            style: ButtonStyle.Link,
            url: `https://www.serebii.net/pokedex-swsh/${pokemon.name}`
          }),
          new ButtonBuilder({
            label: 'Smogon',
            style: ButtonStyle.Link,
            url: `https://www.smogon.com/dex/ss/pokemon/${pokemon.name}`
          })
        ]
      });

    return msg.edit({ content: '', embeds: [embed], components: [component] });
  }
});