export class BattleLogParser {
    constructor() {
        this.log = [];
        this.players = {};
    }

    parse(log) {
        this.log.push(log);
        const lines = log.split('\n');
        let currentKey = null;

        for (const line of lines) {
            if (line.startsWith('>')) {
                // Ignore lines starting with '>'
                this.battleId = line.slice(1);
            } else if (line.startsWith('|')) {
                // Parse data lines starting with '|'
                const dataLine = line.slice(1).split('|');
                const key = dataLine[0].trim();
                const value = dataLine[1] ? dataLine[1].trim() : '';

                if (key === 'player') {
                    this.players[value]={
                        id: value,
                        name: dataLine[2],
                        num: dataLine[3]
                    };
                } else if (key === 'teamsize') {
                    const player = dataLine[1] ? dataLine[1].trim() : '';
                    const teamSize = parseInt(dataLine[2] ? dataLine[2].trim() : 0);
                    if(!this.players[player])
                        this.players[player]={}
                    this.players[player]['team']=new Array(teamSize).fill({})
                } else if (key === 'gen') {
                    this.gen = parseInt(value);
                } else if (key === 'tier') {
                    this.tier = value;
                } else if (key === 'rule') {
                    if (!this.rules) {
                        this.rules = [];
                    }
                    this.rules.push(value);
                } else if (key === 't:') {
                    this.timestamp = parseInt(value);
                } else if (key === 'start') {
                    this.battleStarted = true;
                } else if (key === 'switch') {
                    // p1a p1's a or b pokemon b for double battles, we'll assume single battles so no b
                    const switchData = value.split('a: ');
                    const playerId = switchData[0] ? switchData[0].trim() : '';
                    const pokemonInfo = dataLine[2].split(',');
                    const pokemonName = switchData[1].trim();
                    const pokemonType = pokemonInfo[0];
                    const level = parseInt(pokemonInfo[1].slice(2));
                    const gender = pokemonInfo[2];
                    const [currentHP, maxHP] = dataLine[3].split('/').map((d)=>parseInt(d));
                    const isFainted = false;
                    const item = null;
                    const status = null;
                    const boosts = {atk: 0, def: 0, spe: 0, spd: 0, spa: 0};

                    const emptyPokemonIndex = this.findPokemonIndex(playerId,(p)=>!p['pokemonName']);
                    this.players[playerId].team[emptyPokemonIndex] = {
                        pokemonName,
                        pokemonType,
                        level,
                        gender,
                        currentHP,
                        maxHP,
                        isFainted,
                        item,
                        status,
                        boosts,
                        moves: new Set()
                    };
                    this.players[playerId]['active'] = this.players[playerId].team[emptyPokemonIndex];
                } else if (key === 'move') {
                    // p1a p1's a or b pokemon b for double battles, we'll assume single battles so no b
                    const moveData = value.split('a: ');
                    const playerId = moveData[0] ? moveData[0].trim() : '';
                    const pokemonName = moveData[1] ? moveData[1].trim() : '';
                    const moveName = dataLine[2] ? dataLine[2].trim() : '';

                    const pokemonIndexByName = this.findPokemonIndex(playerId, (p)=>p.pokemonName === pokemonName);
                    this.players[playerId].team[pokemonIndexByName].moves.add(moveName);
                } else if (key === '-damage' || key === '-heal' || key === '-status' || key === '-activate' || key === '-boost' || key === '-unboost' || key === '-immune'){
                    const playerId = dataLine[1] ? dataLine[1].trim().split('a: ')[0] : '';
                    const pokemonName = dataLine[1] ? dataLine[1].trim().split('a: ')[1] : '';
                    let [currentHP, maxHP] = [];
                    let pokemonIndexByName = -1;
                    try {
                        [currentHP, maxHP] = dataLine[2].split('/').map((d) => parseInt(d));
                        pokemonIndexByName = this.findPokemonIndex(playerId, (p)=>p.pokemonName === pokemonName);
                    }catch (e) { // failure with revival blessing?
                        console.error(e);
                        console.log('something went wrong here.');
                        continue;
                    }
                    this.players[playerId].team[pokemonIndexByName].currentHP = currentHP;
                    if(dataLine.length > 3 && dataLine[3].indexOf('item: ') >= 0){
                        this.players[playerId].team[pokemonIndexByName].item = dataLine[3].split('item: ')[1];
                    }
                    if(dataLine.length > 3 && dataLine[3].indexOf('ability: ') >= 0){
                        this.players[playerId].team[pokemonIndexByName].ability = dataLine[3].split('ability: ')[1];
                    }
                    if(key === '-status'){
                        this.players[playerId].team[pokemonIndexByName].status = dataLine[2];
                    }
                    if(key === '-boost' || key === '-unboost'){ // TODO terra
                        const m = key === '-unboost' ? -1 : 1;
                        this.players[playerId].team[pokemonIndexByName].boosts[dataLine[2]] = m * parseInt(dataLine[3]);
                    }
                } else if (key === 'faint') {
                    const playerId = dataLine[1].trim().split('a: ')[0];
                    const pokemonName = dataLine[1].trim().split('a: ')[1];
                    const pokemonIndexByName = this.findPokemonIndex(playerId, (p)=>p.pokemonName === pokemonName);
                    this.players[playerId].team[pokemonIndexByName].isFainted = true;
                } else if (key === 'turn') {
                    this.turnNumber = parseInt(value);
                }
            }
        }
    }
    findPokemonIndex(playerId, criteria){
        return this.players[playerId].team.findIndex(criteria)
    }

    getOpponent(myUsername) {
        return this.players['p1'].name !== myUsername ? this.players['p1'] : this.players['p2'];
    }
}



/*
>battle-gen9randombattle-1914976110
|player|p2|randombot1|101|
|teamsize|p1|6
|teamsize|p2|6
|gen|9
|tier|[Gen 9] Random Battle
|rule|Species Clause: Limit one of each Pokémon
|rule|HP Percentage Mod: HP is shown in percentages
|rule|Sleep Clause Mod: Limit one foe put to sleep
|
|t:|1690919048
|start
|switch|p1a: Noivern|Noivern, L82, F|274/274
|switch|p2a: Kricketune|Kricketune, L98, M|100/100
|turn|1

>battle-gen9randombattle-1914976110
|
|t:|1690919105
|move|p1a: Noivern|Flamethrower|p2a: Kricketune
|-supereffective|p2a: Kricketune
|-damage|p2a: Kricketune|29/100
|move|p2a: Kricketune|Taunt|p1a: Noivern
|-start|p1a: Noivern|move: Taunt
|
|upkeep
|turn|2

>battle-gen9randombattle-1914976110
|
|t:|1690919125
|switch|p2a: Farigiraf|Farigiraf, L90, F|100/100
|turn|3

>battle-gen9randombattle-1914976110
|
|t:|1690919140
|move|p1a: Noivern|Flamethrower|p2a: Farigiraf
|-crit|p2a: Farigiraf
|-damage|p2a: Farigiraf|57/100
|move|p2a: Farigiraf|Hyper Voice|p1a: Noivern
|-damage|p1a: Noivern|138/274
|
|-heal|p2a: Farigiraf|63/100|[from] item: Leftovers
|upkeep
|turn|4

>battle-gen9randombattle-1914976110
|
|t:|1690919153
|move|p1a: Noivern|Flamethrower|p2a: Farigiraf
|-damage|p2a: Farigiraf|36/100
|move|p2a: Farigiraf|Future Sight|p1a: Noivern
|-start|p2a: Farigiraf|move: Future Sight
|
|-heal|p2a: Farigiraf|42/100|[from] item: Leftovers
|-end|p1a: Noivern|move: Taunt
|upkeep
|turn|5

>battle-gen9randombattle-1914976110
|
|t:|1690919164
|move|p1a: Noivern|Flamethrower|p2a: Farigiraf
|-damage|p2a: Farigiraf|15/100
|-status|p2a: Farigiraf|brn
|move|p2a: Farigiraf|Future Sight||[still]
|-fail|p2a: Farigiraf
|
|-heal|p2a: Farigiraf|21/100 brn|[from] item: Leftovers
|-damage|p2a: Farigiraf|15/100 brn|[from] brn
|upkeep
|turn|6

>battle-gen9randombattle-1914976110
|
|t:|1690919175
|move|p1a: Noivern|Flamethrower|p2a: Farigiraf
|-damage|p2a: Farigiraf|0 fnt
|faint|p2a: Farigiraf
|
|-end|p1a: Noivern|move: Future Sight
|-damage|p1a: Noivern|0 fnt
|faint|p1a: Noivern
|upkeep

>battle-gen9randombattle-1914976110
|
|t:|1690919186
|switch|p1a: Tauros|Tauros-Paldea-Blaze, L81, M|252/252
|switch|p2a: Dedenne|Dedenne, L88, M|100/100
|turn|7

>battle-gen9randombattle-1914976110
|
|t:|1690919207
|move|p2a: Dedenne|Thunderbolt|p1a: Tauros
|-damage|p1a: Tauros|137/252
|move|p1a: Tauros|Substitute|p1a: Tauros
|-start|p1a: Tauros|Substitute
|-damage|p1a: Tauros|74/252
|-enditem|p1a: Tauros|Sitrus Berry|[eat]
|-heal|p1a: Tauros|137/252|[from] item: Sitrus Berry
|
|upkeep
|turn|8

>battle-gen9randombattle-1914976110
|
|t:|1690919220
|move|p2a: Dedenne|Dazzling Gleam|p1a: Tauros
|-end|p1a: Tauros|Substitute
|move|p1a: Tauros|Bulk Up|p1a: Tauros
|-boost|p1a: Tauros|atk|1
|-boost|p1a: Tauros|def|1
|
|-activate|p1a: Tauros|ability: Cud Chew
|-enditem|p1a: Tauros|Sitrus Berry|[eat]
|-heal|p1a: Tauros|200/252|[from] item: Sitrus Berry
|upkeep
|turn|9

>battle-gen9randombattle-1914976110
|
|t:|1690919242
|move|p2a: Dedenne|Dazzling Gleam|p1a: Tauros
|-damage|p1a: Tauros|100/252
|move|p1a: Tauros|Substitute|p1a: Tauros
|-start|p1a: Tauros|Substitute
|-damage|p1a: Tauros|37/252
|
|upkeep
|turn|10

>battle-gen9randombattle-1914976110
|
|t:|1690919256
|move|p2a: Dedenne|Dazzling Gleam|p1a: Tauros
|-end|p1a: Tauros|Substitute
|move|p1a: Tauros|Raging Bull|p2a: Dedenne
|-damage|p2a: Dedenne|31/100
|-enditem|p2a: Dedenne|Sitrus Berry|[eat]
|-heal|p2a: Dedenne|56/100|[from] item: Sitrus Berry
|-heal|p2a: Dedenne|89/100|[from] ability: Cheek Pouch
|
|upkeep
|turn|11

>battle-gen9randombattle-1914976110
|
|t:|1690919284
|move|p2a: Dedenne|Thunderbolt|p1a: Tauros
|-damage|p1a: Tauros|0 fnt
|faint|p1a: Tauros
|
|upkeep

>battle-gen9randombattle-1914976110
|
|t:|1690919315
|switch|p1a: Scizor|Scizor, L79, M|240/240
|turn|12

>battle-gen9randombattle-1914976110
|
|t:|1690919324
|move|p1a: Scizor|Bullet Punch|p2a: Dedenne
|-damage|p2a: Dedenne|57/100
|move|p2a: Dedenne|Thunderbolt|p1a: Scizor
|-damage|p1a: Scizor|131/240
|
|-heal|p1a: Scizor|146/240|[from] item: Leftovers
|upkeep
|turn|13

>battle-gen9randombattle-1914976110
|
|t:|1690919346
|move|p2a: Dedenne|Thunderbolt|p1a: Scizor
|-damage|p1a: Scizor|47/240
|move|p1a: Scizor|Close Combat|p2a: Dedenne
|-resisted|p2a: Dedenne
|-damage|p2a: Dedenne|35/100
|-unboost|p1a: Scizor|def|1
|-unboost|p1a: Scizor|spd|1
|
|-heal|p1a: Scizor|62/240|[from] item: Leftovers
|upkeep
|turn|14

>battle-gen9randombattle-1914976110
|
|t:|1690919361
|move|p2a: Dedenne|Thunderbolt|p1a: Scizor
|-damage|p1a: Scizor|0 fnt
|faint|p1a: Scizor
|
|upkeep

>battle-gen9randombattle-1914976110
|
|t:|1690919376
|switch|p2a: Palossand|Palossand, L88, M|100/100
|turn|16

>battle-gen9randombattle-1914976110
|
|t:|1690919392
|move|p1a: Urshifu|Poison Jab|p2a: Palossand
|-resisted|p2a: Palossand
|-damage|p2a: Palossand|97/100
|move|p2a: Palossand|Earth Power|p1a: Urshifu
|-damage|p1a: Urshifu|102/270
|
|-heal|p2a: Palossand|100/100|[from] item: Leftovers
|upkeep
|turn|17

>battle-gen9randombattle-1914976110
|
|t:|1690919407
|switch|p1a: Azelf|Azelf, L82|257/257
|move|p2a: Palossand|Earth Power|p1a: Azelf
|-immune|p1a: Azelf|[from] ability: Levitate
|
|upkeep
|turn|18

>battle-gen9randombattle-1914976110
|
|t:|1690919420
|move|p1a: Azelf|Psyshock|p2a: Palossand
|-damage|p2a: Palossand|56/100
|move|p2a: Palossand|Earth Power|p1a: Azelf
|-immune|p1a: Azelf|[from] ability: Levitate
|
|-heal|p2a: Palossand|63/100|[from] item: Leftovers
|upkeep
|turn|19

>battle-gen9randombattle-1914976110
|
|t:|1690919438
|move|p1a: Azelf|Psyshock|p2a: Palossand
|-damage|p2a: Palossand|21/100
|move|p2a: Palossand|Earth Power|p1a: Azelf
|-immune|p1a: Azelf|[from] ability: Levitate
|
|-heal|p2a: Palossand|27/100|[from] item: Leftovers
|upkeep
|turn|20

>battle-gen9randombattle-1914976110
|
|t:|1690919452
|switch|p2a: Persian|Persian, L93, F|100/100
|turn|21

>battle-gen9randombattle-1914976110
|
|t:|1690919462
|move|p2a: Persian|Body Slam|p1a: Azelf
|-damage|p1a: Azelf|111/257
|-damage|p2a: Persian|91/100|[from] item: Life Orb
|move|p1a: Azelf|Psyshock|p2a: Persian
|-damage|p2a: Persian|32/100
|
|upkeep
|turn|22

>battle-gen9randombattle-1914976110
|
|t:|1690919475
|move|p2a: Persian|Foul Play|p1a: Azelf
|-supereffective|p1a: Azelf
|-damage|p1a: Azelf|0 fnt
|faint|p1a: Azelf
|-damage|p2a: Persian|22/100|[from] item: Life Orb
|
|upkeep

>battle-gen9randombattle-1914976110
|
|t:|1690919490
|switch|p2a: Bruxish|Bruxish, L85, M|100/100
|turn|24

>battle-gen9randombattle-1914976110
|
|t:|1690919501
|switch|p1a: Gardevoir|Gardevoir, L83, F|249/249
|-ability|p1a: Gardevoir|Strong Jaw|[from] ability: Trace|[of] p2a: Bruxish
|move|p2a: Bruxish|Aqua Jet|p1a: Gardevoir
|-damage|p1a: Gardevoir|179/249
|-damage|p2a: Bruxish|91/100|[from] item: Life Orb
|
|upkeep
|turn|25

>battle-gen9randombattle-1914976110
|
|t:|1690919522
|move|p1a: Gardevoir|Moonblast|p2a: Bruxish
|-damage|p2a: Bruxish|35/100
|move|p2a: Bruxish|Wave Crash|p1a: Gardevoir
|-damage|p1a: Gardevoir|0 fnt
|faint|p1a: Gardevoir
|-damage|p2a: Bruxish|12/100|[from] Recoil
|-damage|p2a: Bruxish|2/100|[from] item: Life Orb
|
|upkeep

>battle-gen9randombattle-1914976110
|
|t:|1690919532
|switch|p1a: Urshifu|Urshifu, L74, F|102/270
|turn|26



 */