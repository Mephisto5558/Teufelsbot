import type { Locale } from '@mephisto5558/i18n';

import { ActionRowBuilder, ButtonBuilder, ButtonStyle, Colors, EmbedBuilder, bold, inlineCode } from 'discord.js';
import { AllContexts, Command, CommandType, OptionType, capitalize } from '@mephisto5558/command';
import Pokedex from 'pokedex-promise-v2';
import { maxPercentage } from '#utils/constants';

const
  DM_TO_CM = 10,
  DM_TO_M = .1,
  HG_TO_G = 100, // Hectogram
  HG_TO_KG = .1,
  GENDER_RATE = 8, // See https://pokeapi.co/docs/v2#pokemonspeciesgender
  pokedex = new Pokedex(),

  cache = {
    localNames: {} as Record<Pokedex.PokemonSpecies['name'], Record<Locale, string>>,
    autocomplete: [] as string[],
    initPromise: undefined as Promise<void> | undefined,

    fill: async (): Promise<void> => {
      if (cache.autocomplete.length) return;

      cache.initPromise ??= (async (): Promise<void> => {
        const speciesDetails = await pokedex.getResource((await pokedex.getPokemonSpeciesList()).results.map(e => e.url)) as Pokedex.PokemonSpecies[];

        for (const species of speciesDetails)
          cache.localNames[species.name] = Object.fromEntries(species.names.map(e => [e.language.name, e.name.toLowerCase()]));

        cache.autocomplete = Object.entries(cache.localNames).flatMap(([k, v]) => [k, ...Object.values(v)]);
      })();

      return cache.initPromise;
    },
    findDefaultName: (query: string): string => (query in cache.localNames
      ? query
      : Object.entries(cache.localNames).find(([, v]) => Object.values(v).includes(query))?.[0] ?? query)
  };

await cache.fill();

async function getEvolutions(pokemon: Pokedex.Pokemon): Promise<string[]> {
  const
    getEvolutionNames = (chain: Pokedex.Chain): string[] => [chain.species.name, ...chain.evolves_to.flatMap(getEvolutionNames)],

    /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- this is correct in the case of giving it a species url */
    species = await pokedex.getResource(pokemon.species.url) as Pokedex.PokemonSpecies;

  /* eslint-disable-next-line @typescript-eslint/no-unsafe-argument, @typescript-eslint/no-unsafe-member-access -- will always be a chain */
  return getEvolutionNames((await pokedex.getResource(species.evolution_chain.url)).chain);
}

type GenderRate = -1 | 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8;
function getGenderRate(genderRate: GenderRate, lang: lang): string {
  switch (genderRate) {
    case -1: return lang('gender.genderless');
    case 0: return lang('gender.male');
    case GENDER_RATE: return lang('gender.female');
    default: {
      const
        male = (1 - genderRate / GENDER_RATE) * maxPercentage,
        female = (genderRate / GENDER_RATE) * maxPercentage;

      return lang('gender.ratios', { female: inlineCode(female.toString()), male: inlineCode(male.toString()) });
    }
  }
}

export default new Command({
  types: [CommandType.Slash, CommandType.Prefix],
  usage: { examples: 'Bulbasaur' },
  contexts: AllContexts,
  options: [{
    name: 'pokémon',
    type: OptionType.String,
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
      pokemon = await pokedex.getPokemonByName(cache.findDefaultName((this.options?.getString('pokémon', true) ?? this.args![0]!).toLowerCase())),

      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion
        -- Not using `getPokemonSpeciesByName` to better utilize the lib's cache. */
      species = await pokedex.getResource(pokemon.species.url) as Pokedex.PokemonSpecies,
      localName = cache.localNames[species.name]?.[this.guild?.localeCode ?? this.user.localeCode ?? lang.defaultConfig.defaultLocale],
      height = pokemon.height < DM_TO_CM
        ? `${Number.parseFloat((pokemon.height * DM_TO_CM).toFixed(2))}cm`
        : `${Number.parseFloat((pokemon.height * DM_TO_M).toFixed(2))}m`,
      weight = pokemon.weight < HG_TO_KG
        ? `${Number.parseFloat((pokemon.weight * HG_TO_G).toFixed(2))}g`
        : `${Number.parseFloat((pokemon.weight * HG_TO_KG).toFixed(2))}kg`,

      /* eslint-disable-next-line @typescript-eslint/no-unsafe-type-assertion -- this is correct in the case of giving it a generation url */
      generationRes = await pokedex.getResource(species.generation.url) as Pokedex.Generation,
      embed = new EmbedBuilder({
        thumbnail: { url: pokemon.sprites.other.showdown.front_default },
        color: Colors.Blurple,
        footer: {
          text: species.flavor_text_entries
            .findLast(e => e.language.name == (this.guild?.localeCode ?? this.user.localeCode)).flavor_text
            .replaceAll('\f', '\n') // See https://github.com/veekun/pokedex/issues/218#issuecomment-339841781, https://github.com/PokeAPI/pokeapi/issues/719#issuecomment-1161745161
            .replaceAll(/\u{AD}\n?/gu, '')
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
          [lang('genderRatio'), getGenderRate(species.gender_rate as GenderRate, lang)],
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
        ].map(([k, v]) => ({ name: k, value: v, inline: false }))
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