import {AbstractPokemonShowdownBot, MOVE_TYPES} from "./AbstractPokemonShowdownBot.js";
import {findHighestDamageMove} from "../utils/battleSim.mjs";
import {getRandomValueFromArray, getRandomWeightedMove} from "../utils/math.js";
export class StrongestMoveBot extends AbstractPokemonShowdownBot {
    forceSwitch(pokemons) {
        // TODO pick the pokemon with the strongest move against the active pokemon
        const randomPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
        this.choose(MOVE_TYPES.SWITCH, randomPokemon);
    }
    fight() {
        try {
            // given the oppenent's mon as Lumineon|Lumineon, L92, M|49/276
            // returns a map of { move: damage }
            // TODO why would it pick earthquake against a flying type? does it think it's a non-damaging move?
            const damageMap = findHighestDamageMove(this.request.side.pokemon.filter((p) => p.active)[0], this.opponentPokemon+"|"+this.oppAbility);
            // prioritize a kill, if damageMap.moves has a move with damage >= 100% then pick it without getting a weighted move
            const killMoves = Object.fromEntries(Object.entries(damageMap.moves).filter(([key, value]) => value >= 100));
            if(Object.keys(killMoves).length > 0){
                this.choose(MOVE_TYPES.MOVE, getRandomValueFromArray(Object.keys(killMoves)));
            }else {
                // damage is weighted where non-damaging moves are 20% chance
                const move = getRandomWeightedMove(damageMap.moves); // curious if i should lower chance of non-damaging moves, obviously i'm assuming they are good
                this.choose(MOVE_TYPES.MOVE, move);
            }
        }catch (e){
            console.error(e);
            console.log("Picking random move");
            // something we wrong here let's just pick a random move
            this.choose(MOVE_TYPES.MOVE, this.moves[Math.floor(Math.random() * this.moves.length)]);
        }
    }
}
// fix for this bot TODO
// - this bot switches on error
// - this bot will run roost even with full hp or close to it, seeds if already seed, ect
// - need to switch when there is no chance (maybe highest damaging move is less than 20% hp)
// - sleep talk is considered non damaging so it has an equal chance to be used at any point as if it was toxic
// - sucker punch spam

// next bot will work with switches.
// switch if:
// - opp does more damage than me
// - i have mon that takes no damage from opp & current mon does less
// - i have mon that can out damage opp even if opp gets one more move on me
// keep in mind these have to take into account opp speed
// given format i might be able to query opp data