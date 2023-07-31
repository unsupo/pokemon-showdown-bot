import {AbstractPokemonShowdownBot, MOVE_TYPES} from "./AbstractPokemonShowdownBot.js";

export class RandomBot extends AbstractPokemonShowdownBot {
    forceSwitch(pokemons) {
        const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
        this.choose(MOVE_TYPES.SWITCH, randomPokemon);
    }
    fight() {
        const randomMove = this.moves[Math.floor(Math.random() * this.moves.length)];
        this.choose(MOVE_TYPES.MOVE, randomMove);
    }
}
