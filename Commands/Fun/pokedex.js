const
  { EmbedBuilder, Colors, ActionRowBuilder, ButtonBuilder, ButtonStyle, Collection } = require('discord.js'),
  fetch = require('node-fetch').default,
  cache = new Collection();

module.exports = {
  name: 'pokedex',
  prefixCommand: true,
  slashCommand: true,
  options: [{
    name: 'pokémon',
    type: 'String',
    required: true
  }],

  run: async function (lang) {
    const pokemon = this.options?.getString('pokémon') || this.args[0];
    let res = cache.get(pokemon.toLowerCase());

    if (!res) {
      try { res = (await fetch(`https://pokeapi.glitch.me/v1/pokemon/${pokemon}`).then(e => e.json()))?.[0]; }
      catch (err) {
        if (err.type == 'invalid-json') return this.customReply(lang('invalidJson'));
        throw err;
      }
      if (res) {
        const [feet, inches] = res.height.split('\'').map(parseFloat);
        res.height = (feet * 12 + inches) * 2.54;
        if (res.height < 100) res.height += 'cm';
        else res.height = parseFloat((res.height / 100).toFixed(2)) + 'm';

        if (res.name) cache.set(res.name.toLowerCase(), res);
      }
    }

    if (!res || res.error == 404) return this.customReply(lang('notFound')); //`Couldn't find a pokémon with name ${pokemon}`
    if (res.error) {
      this.client.error('pokedex.js: The api returned an error!', res);
      return this.customReply(lang('error'));
    }

    const
      name = res.name.toLowerCase(),
      embed = new EmbedBuilder({
        thumbnail: { url: `https://play.pokemonshowdown.com/sprites/ani/${name}.gif` },
        color: Colors.Blurple,
        footer: { text: res.description },
        author: {
          name: `PokéDex: ${res.name}`,
          iconURL: `https://play.pokemonshowdown.com/sprites/ani/${name}.gif`
        },
        fields: [
          { name: lang('types'), value: res.types.join(', '), inline: false },
          { name: lang('abilities'), value: `${res.abilities.normal}${res.abilities.hidden ? ' and ' + res.abilities.hidden : ''}.`, inline: false },
          { name: lang('genderRatio'), value: res.gender?.join(', ') || lang('noGender'), inline: false },
          { name: lang('heightWeight'), value: `${res.height}, ${(parseFloat(res.weight) / 2.205).toFixed(2)}kg`, inline: false },
          { name: lang('evolutionLine'), value: res.family.evolutionLine.join(', ') + lang('currentStage', res.family.evolutionStage), inline: false },
          { name: lang('gen'), value: res.gen, inline: false }
        ]
      }),
      component = new ActionRowBuilder({
        components: [
          new ButtonBuilder({
            label: 'Bulbapedia',
            style: ButtonStyle.Link,
            url: `https://bulbapedia.bulbagarden.net/wiki/${res.name}`
          }),
          new ButtonBuilder({
            label: 'Serebii',
            style: ButtonStyle.Link,
            url: `https://www.serebii.net/pokedex-swsh/${name}`
          }),
          new ButtonBuilder({
            label: 'Smogon',
            style: ButtonStyle.Link,
            url: `https://www.smogon.com/dex/ss/pokemon/${name}`
          })
        ]
      });

    this.customReply({ embeds: [embed], components: [component] });
  }
};