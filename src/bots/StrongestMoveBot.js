import {AbstractPokemonShowdownBot, MOVE_TYPES} from "./AbstractPokemonShowdownBot.js";
import {findHighestDamageMove} from "../utils/battleSim.mjs";
import {getRandomValueFromArray, getRandomWeightedMove} from "../utils/math.js";
export class StrongestMoveBot extends AbstractPokemonShowdownBot {
    forceSwitch(pokemons) {
        let strongestPokemon;
        try {
            let strongestMove = -Infinity;
            for (const pokemon in this.request.side.pokemon.filter((p) => !p.active && !p.fainted)) {
                const damageMap = findHighestDamageMove(pokemon, this.opponentPokemon);
                const [keyWithHighestValue, highestValue] = Object.entries(damageMap).reduce(
                    (acc, [key, value]) => (value > acc[1] ? [key, value] : acc),
                    ['', -Infinity]
                );
                if (highestValue > strongestMove) {
                    strongestMove = highestValue;
                    strongestPokemon = pokemon;
                }
            }
        }catch (e) {
            console.error(e);
            console.log('Picking random pokemon');
            strongestPokemon = pokemons[Math.floor(Math.random() * pokemons.length)];
        }
        this.choose(MOVE_TYPES.SWITCH, strongestPokemon);
    }
    fight() {
        try {
            // TODO switch out if bad matchup
            // given the oppenent's mon as Lumineon|Lumineon, L92, M|49/276
            // returns a map of { move: damage }
            const active = this.request.side.pokemon.filter((p) => p.active)[0];
            active.moves = this.request.active[0].moves.map((m)=>m.move);
            const damageMap = findHighestDamageMove(active, this.opponentPokemon);
            // remove disabled moves
            for (const obj of this.request.active[0].moves) { //TypeError: Cannot read properties of undefined (reading '0')
                if (obj.disabled && damageMap.moves.hasOwnProperty(obj.move)) {
                    delete damageMap.moves[obj.move];
                }
            }
            // prioritize a kill, if damageMap.moves has a move with damage >= 100% then pick it without getting a weighted move
            const killMoves = Object.fromEntries(Object.entries(damageMap.moves).filter(([key, value]) => value >= 100));
            if(Object.keys(killMoves).length > 0){
                this.choose(MOVE_TYPES.MOVE, getRandomValueFromArray(Object.keys(killMoves)));
            }else {
                // damage is weighted where non-damaging moves are 20% chance
                const move = getRandomWeightedMove(damageMap.moves); // curious if i should lower chance of non-damaging moves, obviously i'm assuming they are good
                if(!move)
                    if(this.request.side.pokemon.filter((p)=>!p.fainted).length === 1)// length of pokemon < 1 means this is my last mon so i can't switch out
                        this.choose(MOVE_TYPES.MOVE, Object.keys(damageMap.moves)[0]);
                    else
                        this.forceSwitch(this.pokemons);
                else
                    this.choose(MOVE_TYPES.MOVE, move);
            }
        }catch (e){
            console.error(e);
            console.log("Picking random move");
            // something went wrong here let's just pick a random move
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

// in theory i should check
// - how much damage i do and how much damage my opponent could do
// - i check how much damage each and my opponent does against my switches

// next bot will work with switches.
// switch if:
// - opp does more damage than me
// - i have mon that takes no damage from opp & current mon does less
// - i have mon that can out damage opp even if opp gets one more move on me
// keep in mind these have to take into account opp speed
// given format i might be able to query opp data