import { calculate, Generations, Pokemon, Move } from '@ajhyndman/smogon-calc';
import {Battle, BattleStreams} from "@pkmn/sim";

// import { BattleStream } from '@pkmn/sim';
export function findHighestDamageMove(attacker, defender) {
    const gen = Generations.get(9); // You can change the generation if needed
    // Sets.importSet(defenderPokemon.name, 'gen8ou');
    // Create an instance of the attacker Pokemon with its stats and moves
    let attackerPokemon;
    try {
        attackerPokemon = new Pokemon(gen, attacker.details.split(',')[0], {
            item: attacker.item,
            ability: attacker.ability,
            level: parseInt(attacker.details.split(',')[1].trim().slice(1)),
            // gender: attacker.details.split(',')[2].trim(), // do i need gender
            curHP: parseInt(attacker.condition.split('/')[0], 10),
            baseStats: {
                ...attacker.stats,
                hp: parseInt(attacker.condition.split('/')[1], 10),
            },
        });
    }catch (e) {
        throw e;
    }
    /*
    // TODO set no damage moves apart from non damaging moves
    // Create an instance of the defender Pokemon with its stats
    const defenderDetails = defender.split('|')[1];
    let defenderHP;
    try {
        defenderHP = defender.split('|')[2].split('/');
    }catch (e) {
        throw e;
    }
    // if the defenderLevel fails assume it's my level example failure Iron Thorns|Quark Drive|[silent]|undefined (why [silent])?
    let defenderLevel = parseInt(attacker.details.split(',')[1].trim().slice(1));
    try{
        defenderLevel = parseInt(defenderDetails.split(',')[1].trim().slice(1)); // why did this fail?
    }catch (e) {
        console.log(defender);
        throw e;
    }
    const ability = defender.split("|").length > 3 ? defender.split('|')[3] : null;
    let defenderPokemon;
    try {
        defenderPokemon = new Pokemon(gen, defenderDetails.split(',')[0], {
            level: defenderLevel,
            // gender: defenderDetails.split(',')[2].trim(), // this failed do i need gender?
            curHP: parseInt(defenderHP[0]),
            baseStats: {hp: parseInt(defenderHP[1])},
            ...(ability ? {ability: ability} : {})
        });
    }catch (e) {
        console.log(defender);
        throw e;
    }
    */
    const defenderPokemon = new Pokemon(gen, defender.pokemonType,{
        level: defender.level,
        ...(defender.gender ? {gender: defender.gender}:{}),
        curHP: defender.currentHP,
        baseStats: {hp: (defender.hp ? defender.hp : defender.maxHP)},
        boosts: defender.boosts,
        ...(defender.ability ? {ability: defender.ability} : {}),
        ...(defender.item ? {item: defender.item} : {}),
        ...(defender.status ? {status: defender.status} : {})
    })
    // Calculate the damage for each move and find the move with the highest damage
    const damageMoveMap = {}

    for (const moveName of attacker.moves) {
        const move = new Move(gen, moveName);
        const result = calculate(gen, attackerPokemon, defenderPokemon, move); // TypeError: Cannot read properties of undefined (reading '0')
        if(move.category === "Status"){
            damageMoveMap[move.name]=-1;
            continue;
        }
        damageMoveMap[move.name]=getAverage(typeof result.damage === 'number' ? result.damage : result.damage.map((d)=>d/result.defender.originalCurHP*100));
    }

    // return Object.keys(sortDictionaryByValue(damageMoveMap))[0];
    return { moves: sortDictionaryByValue(damageMoveMap), isFaster: attackerPokemon.speed > defenderPokemon.speed };
}
const getAverage = (arr) => typeof arr === 'number' ? arr : arr.reduce((acc, curr) => acc + curr, 0) / arr.length;
const sortDictionaryByValue = (dictionary) => Object.fromEntries(Object.entries(dictionary).sort((a, b) => b[1] - a[1]));

async function simulateBattle(attacker, defender) {
    // Create a new battle with the specified ruleset
    const battle = new Battle({
        effectType: 'Format',
        ruleset: ['Standard'],
        banlist: [],
        unbanlist: [], // Add any unbanned Pokémon names if needed, otherwise leave it as an empty array
        restricted: [], // Add any restricted Pokémon names if needed, otherwise leave it as an empty array
    });

    // Join as player 1 and player 2 with their teams
    battle.setPlayer('p1', [
        {
            name: attacker.name,
            species: attacker.species,
            moves: attacker.moves,
        },
    ]);
    battle.setPlayer('p2', [
        {
            name: defender.name,
            species: defender.species,
            moves: defender.moves,
        },
    ]);

    // Execute the move choices for player 1 and player 2
    battle.choose('p1', `move ${attacker.move}`);
    battle.choose('p2', `move ${defender.move}`);

    // Process the battle and get the result
    let result = '';
    battle.on('line', (line) => {
        result += line + '\n';
    });

    await battle.start();
    return result;
}

export async function findStrongestMove(attacker, defender) {
    const moves = attacker.moves;
    let strongestMove = null;
    let maxDamage = -1;

    for (const move of moves) {
        attacker.move = move;
        const result = await simulateBattle(attacker, defender);

        // Extract the damage from the result
        const damage = parseInt(result.split(' - ')[1].split(' ')[0], 10);

        if (damage > maxDamage) {
            strongestMove = move;
            maxDamage = damage;
        }
    }

    return strongestMove;
}

