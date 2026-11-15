# Project Context

Create a React/Vite web application which can find and present data about existing Pokémon.
## Requirements
1. The homepage should be suitable for children age 8-12
2. The homepage should present filters for the following Pokémon characteristics:
    - Type
    - Region
    - A flag whether to include Evelutions or only base forms
3. A `Find` button which will retrieve the Pokémon data from a popular source of information. Please suggest a source for this data.
4. The data displayed should include:
    - Name
    - Index Number
    - Type
    - Region
    - Strength
    - Attacks
    - Strengths
    - Weaknesses

## Design decisions
- **Data source:** PokéAPI (`https://pokeapi.co/api/v2/`) is the suggested and implemented source. It is a public Pokémon REST API with species, Pokémon, generation, move, sprite, and type matchup data. The interface links to PokéAPI and handles network/API errors in plain language.
- **Region mapping:** The region filter maps Kanto through Paldea to PokéAPI generations I–IX. “All regions” uses the species list across generations. Region is displayed using the species' generation when the search covers all regions.
- **Search behavior:** Find selects a random matching Pokémon. The app checks a shuffled sample of up to 30 species to keep requests modest. The evolution switch is on by default (all evolution stages); switching it off limits results to species with no prior evolution.
- **Name filter:** An optional name search uses a case-insensitive substring (“LIKE”) match against PokéAPI Pokémon names, so partial names work. “Gigantamax” also matches PokéAPI's `gmax` form suffix.
- **Strength:** Presented as base stats (HP, Attack, Defense, Speed) and their combined base-stat total. These are game data, not a prediction of which Pokémon would win a battle.
- **Strengths and weaknesses:** Presented as type matchups from PokéAPI's damage relations. “Strong against” lists types this Pokémon's type deals double damage to; “Watch out for” lists types that deal double damage to it.
- **Attacks:** Four moves are sampled from the Pokémon's available move list and shown by name. Move availability varies by game and level; the interface treats them as examples, not a complete battle-ready move set.
- **Visual direction:** A friendly, calm explorer/Pokédex theme for ages 8–12, using warm green colors, playful Poké Ball motifs, short supportive text, clear labels, and responsive layouts. Controls use native selects and an accessible switch pattern.
