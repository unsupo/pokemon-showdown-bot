// entry point

import {RandomBot} from "./src/bots/RandomBot.js";
import {StrongestMoveBot} from "./src/bots/StrongestMoveBot.js";
import dotenv from "dotenv";

const format = 'gen9randombattle';
dotenv.config({path: `.env.bots`})

const r1 = new StrongestMoveBot(process.env.BOT_1_USERNAME, process.env.BOT_1_PASSWORD);
const r2 = new RandomBot(process.env.BOT_2_USERNAME, process.env.BOT_2_PASSWORD); // obviously random sucks losing badly 4 all battles

// await r2.connect();

await Promise.all([r1.connect(), r2.connect()]);
r1.randomBattle(format);
r2.randomBattle(format);


// r2.challenge(r1.username, 'gen9randombattle')

/*
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
