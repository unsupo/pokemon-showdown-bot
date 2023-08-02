// entry point
import {RandomBot} from "./src/bots/RandomBot.js";

import {StrongestMoveBot} from "./src/bots/StrongestMoveBot.js";
import dotenv from "dotenv";

const format = 'gen9randombattle';
dotenv.config({path: `.env.bots`})

const r1 = new StrongestMoveBot(process.env.BOT_1_USERNAME, process.env.BOT_1_PASSWORD);
// const r2 = new RandomBot(process.env.BOT_2_USERNAME, process.env.BOT_2_PASSWORD); // obviously random sucks losing badly 4 all battles

await r1.connect();

// await Promise.all([r1.connect(), r2.connect()]);
r1.randomBattle(format);
// r2.randomBattle(format);


// r2.challenge(r1.username, 'gen9randombattle')

// import {BattleLogParser} from './src/parsers/BattleLogParser.js'
//
// const blp = new BattleLogParser();
// blp.parse('>battle-gen9randombattle-1915080747\n' +
//     '|\n' +
//     '|t:|1690931249\n' +
//     '|move|p1a: Kilowattrel|Hurricane|p2a: Sandy Shocks\n' +
//     '|-resisted|p2a: Sandy Shocks\n' +
//     '|-crit|p2a: Sandy Shocks\n' +
//     '|-damage|p2a: Sandy Shocks|113/267\n' +
//     '|move|p2a: Sandy Shocks|Thunderbolt|p1a: Kilowattrel\n' +
//     '|-immune|p1a: Kilowattrel|[from] ability: Volt Absorb\n' +
//     '|\n' +
//     '|upkeep\n' +
//     '|turn|21');
// console.log(blp)
/*
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|player|p2|randombot1|101|\n' +
    '|teamsize|p1|6\n' +
    '|teamsize|p2|6\n' +
    '|gen|9\n' +
    '|tier|[Gen 9] Random Battle\n' +
    '|rule|Species Clause: Limit one of each Pokémon\n' +
    '|rule|HP Percentage Mod: HP is shown in percentages\n' +
    '|rule|Sleep Clause Mod: Limit one foe put to sleep\n' +
    '|\n' +
    '|t:|1690919048\n' +
    '|start\n' +
    '|switch|p1a: Noivern|Noivern, L82, F|274/274\n' +
    '|switch|p2a: Kricketune|Kricketune, L98, M|100/100\n' +
    '|turn|1');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919105\n' +
    '|move|p1a: Noivern|Flamethrower|p2a: Kricketune\n' +
    '|-supereffective|p2a: Kricketune\n' +
    '|-damage|p2a: Kricketune|29/100\n' +
    '|move|p2a: Kricketune|Taunt|p1a: Noivern\n' +
    '|-start|p1a: Noivern|move: Taunt\n' +
    '|\n' +
    '|upkeep\n' +
    '|turn|2');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919125\n' +
    '|move|p1a: Noivern|Flamethrower|p2a: Kricketune\n' +
    '|-supereffective|p2a: Kricketune\n' +
    '|-damage|p2a: Kricketune|0 fnt\n' +
    '|faint|p2a: Kricketune\n' +
    '|\n' +
    '|upkeep');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919125\n' +
    '|switch|p2a: Farigiraf|Farigiraf, L90, F|100/100\n' +
    '|turn|3');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919140\n' +
    '|move|p1a: Noivern|Flamethrower|p2a: Farigiraf\n' +
    '|-crit|p2a: Farigiraf\n' +
    '|-damage|p2a: Farigiraf|57/100\n' +
    '|move|p2a: Farigiraf|Hyper Voice|p1a: Noivern\n' +
    '|-damage|p1a: Noivern|138/274\n' +
    '|\n' +
    '|-heal|p2a: Farigiraf|63/100|[from] item: Leftovers\n' +
    '|upkeep\n' +
    '|turn|4');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919153\n' +
    '|move|p1a: Noivern|Flamethrower|p2a: Farigiraf\n' +
    '|-damage|p2a: Farigiraf|36/100\n' +
    '|move|p2a: Farigiraf|Future Sight|p1a: Noivern\n' +
    '|-start|p2a: Farigiraf|move: Future Sight\n' +
    '|\n' +
    '|-heal|p2a: Farigiraf|42/100|[from] item: Leftovers\n' +
    '|-end|p1a: Noivern|move: Taunt\n' +
    '|upkeep\n' +
    '|turn|5'); // TODO notice future sight started and taunt ended
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919164\n' +
    '|move|p1a: Noivern|Flamethrower|p2a: Farigiraf\n' +
    '|-damage|p2a: Farigiraf|15/100\n' +
    '|-status|p2a: Farigiraf|brn\n' +
    '|move|p2a: Farigiraf|Future Sight||[still]\n' +
    '|-fail|p2a: Farigiraf\n' +
    '|\n' +
    '|-heal|p2a: Farigiraf|21/100 brn|[from] item: Leftovers\n' +
    '|-damage|p2a: Farigiraf|15/100 brn|[from] brn\n' +
    '|upkeep\n' +
    '|turn|6');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919175\n' +
    '|move|p1a: Noivern|Flamethrower|p2a: Farigiraf\n' +
    '|-damage|p2a: Farigiraf|0 fnt\n' +
    '|faint|p2a: Farigiraf\n' +
    '|\n' +
    '|-end|p1a: Noivern|move: Future Sight\n' +
    '|-damage|p1a: Noivern|0 fnt\n' +
    '|faint|p1a: Noivern\n' +
    '|upkeep');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919186\n' +
    '|switch|p1a: Tauros|Tauros-Paldea-Blaze, L81, M|252/252\n' +
    '|switch|p2a: Dedenne|Dedenne, L88, M|100/100\n' +
    '|turn|7');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919207\n' +
    '|move|p2a: Dedenne|Thunderbolt|p1a: Tauros\n' +
    '|-damage|p1a: Tauros|137/252\n' +
    '|move|p1a: Tauros|Substitute|p1a: Tauros\n' +
    '|-start|p1a: Tauros|Substitute\n' +
    '|-damage|p1a: Tauros|74/252\n' +
    '|-enditem|p1a: Tauros|Sitrus Berry|[eat]\n' + // TODO he ate the sitrus berry so he doesn't have it anymore....
    '|-heal|p1a: Tauros|137/252|[from] item: Sitrus Berry\n' +
    '|\n' +
    '|upkeep\n' +
    '|turn|8');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919220\n' +
    '|move|p2a: Dedenne|Dazzling Gleam|p1a: Tauros\n' +
    '|-end|p1a: Tauros|Substitute\n' +
    '|move|p1a: Tauros|Bulk Up|p1a: Tauros\n' +
    '|-boost|p1a: Tauros|atk|1\n' +
    '|-boost|p1a: Tauros|def|1\n' +
    '|\n' +
    '|-activate|p1a: Tauros|ability: Cud Chew\n' +
    '|-enditem|p1a: Tauros|Sitrus Berry|[eat]\n' +
    '|-heal|p1a: Tauros|200/252|[from] item: Sitrus Berry\n' +
    '|upkeep\n' +
    '|turn|9');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919242\n' +
    '|move|p2a: Dedenne|Dazzling Gleam|p1a: Tauros\n' +
    '|-damage|p1a: Tauros|100/252\n' +
    '|move|p1a: Tauros|Substitute|p1a: Tauros\n' +
    '|-start|p1a: Tauros|Substitute\n' +
    '|-damage|p1a: Tauros|37/252\n' +
    '|\n' +
    '|upkeep\n' +
    '|turn|10');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919256\n' +
    '|move|p2a: Dedenne|Dazzling Gleam|p1a: Tauros\n' +
    '|-end|p1a: Tauros|Substitute\n' + // TODO end substitute i think this means no more substitute
    '|move|p1a: Tauros|Raging Bull|p2a: Dedenne\n' +
    '|-damage|p2a: Dedenne|31/100\n' +
    '|-enditem|p2a: Dedenne|Sitrus Berry|[eat]\n' +
    '|-heal|p2a: Dedenne|56/100|[from] item: Sitrus Berry\n' +
    '|-heal|p2a: Dedenne|89/100|[from] ability: Cheek Pouch\n' +
    '|\n' +
    '|upkeep\n' +
    '|turn|11');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919284\n' +
    '|move|p2a: Dedenne|Thunderbolt|p1a: Tauros\n' +
    '|-damage|p1a: Tauros|0 fnt\n' +
    '|faint|p1a: Tauros\n' +
    '|\n' +
    '|upkeep');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919315\n' +
    '|switch|p1a: Scizor|Scizor, L79, M|240/240\n' +
    '|turn|12');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919324\n' +
    '|move|p1a: Scizor|Bullet Punch|p2a: Dedenne\n' +
    '|-damage|p2a: Dedenne|57/100\n' +
    '|move|p2a: Dedenne|Thunderbolt|p1a: Scizor\n' +
    '|-damage|p1a: Scizor|131/240\n' +
    '|\n' +
    '|-heal|p1a: Scizor|146/240|[from] item: Leftovers\n' +
    '|upkeep\n' +
    '|turn|13');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919346\n' +
    '|move|p2a: Dedenne|Thunderbolt|p1a: Scizor\n' +
    '|-damage|p1a: Scizor|47/240\n' +
    '|move|p1a: Scizor|Close Combat|p2a: Dedenne\n' +
    '|-resisted|p2a: Dedenne\n' +
    '|-damage|p2a: Dedenne|35/100\n' +
    '|-unboost|p1a: Scizor|def|1\n' +
    '|-unboost|p1a: Scizor|spd|1\n' +
    '|\n' +
    '|-heal|p1a: Scizor|62/240|[from] item: Leftovers\n' +
    '|upkeep\n' +
    '|turn|14');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919361\n' +
    '|move|p2a: Dedenne|Thunderbolt|p1a: Scizor\n' +
    '|-damage|p1a: Scizor|0 fnt\n' +
    '|faint|p1a: Scizor\n' +
    '|\n' +
    '|upkeep');
blp.parse('>battle-gen9randombattle-1914976110\n' +
    '|\n' +
    '|t:|1690919371\n' +
    '|switch|p1a: Urshifu|Urshifu, L74, F|270/270\n' +
    '|turn|15')
console.log(blp);


import {findHighestDamageMove} from "./src/utils/battleSim.mjs";
import {adjustProbabilities, getRandomWeightedMove, randomChoiceByWeight} from "./src/utils/math.js";

const attacker = {
    "ident": "p2: Baxcalibur",
    "details": "Baxcalibur, L76, M",
    "condition": "241/300",
    "active": true,
    "stats": {
        "atk": 264,
        "def": 184,
        "spa": 158,
        "spd": 175,
        "spe": 176
    },
    "moves": [
        "glaiverush",
        "dragondance",
        "earthquake",
        "waterfall"
    ],
    "baseAbility": "thermalexchange",
    "item": "heavydutyboots",
    "pokeball": "pokeball",
    "ability": "thermalexchange",
    "commanding": false,
    "reviving": false,
    "teraType": "Dragon",
    "terastallized": ""
}
const defender = "Altaria|Altaria, L82, F|216/216|Storm Drain";

const damageMap = findHighestDamageMove(attacker, defender);
const prop = adjustProbabilities(damageMap.moves, -1,.2);
const choice = randomChoiceByWeight(prop);
// damage is weighted where non-damaging moves are 20% chance
const move = getRandomWeightedMove(damageMap);
console.log(move);
*/
