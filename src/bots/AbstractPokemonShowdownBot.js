import axios from "axios";
import dotenv from 'dotenv';
import WebSocket from 'ws';
import * as fs from "fs";
dotenv.config();

const MESSAGES = {
    LOGIN: "challstr",
    PM: "pm",
    BATTLE_STARTED: "init",
    REJOIN: "updatesearch",
    LOGGED_IN: "updatesearch"
}
const BATTLE_MESSAGES = {
    INITIALIZE: "player",
    ERROR: "error",
}
export const MOVE_TYPES = {
    SWITCH: "switch",
    MOVE: "move"
}
async function getRegisterAssertion(challstr, username, password){
    try {
        const response = await axios.post('https://play.pokemonshowdown.com/api/register',{
            username: username,
            password: password,
            cpassword: password,
            captcha: 'pikachu',
            challstr: challstr
        });
        return response.data.match(/"assertion":"([^"]+)"/)[1];
    }catch (e){
        console.error('Error registering:', e.message);
        return null;
    }
}
async function getLoginAssertion(challstr, username, password) {
    try {
        const response = await axios.post('https://play.pokemonshowdown.com/api/login', {
            name: username,
            pass: password,
            challstr: challstr,
        });
        return response.data.match(/"assertion":"([^"]+)"/)[1];
    } catch (error) {
        console.error('Error logging in:', error.message);
        return null;
    }
}
export class AbstractPokemonShowdownBot {
    history = [];
    battleId;
    opponentPokemon;
    oppAbility;
    isBattleTimerOn = false;
    filename = 'bot_data.json';
    isNewUser = false;
    constructor(username, password, isNewUser=false) {
        this.username = username;
        this.password = password;
        this.ws = new WebSocket(`ws://${process.env.SERVER}:${process.env.PORT}/showdown/websocket`);
        this.isLoggedIn = false;
        this.isBattling = false;
        this.isNewUser = isNewUser;
    }

    randomBattle(format){
        this.ws.send(`|/search ${format}`)
    }
    challenge(username, format){
        this.ws.send(`|/cmd userdetails ${username}`);
        this.ws.send(`|/utm null`);
        this.ws.send(`|/challenge ${username}, ${format}`);
    }
    // Function to log in as your bot
    login(message, username, password) {
        const challstr = message.toString().replace('|challstr|', '');
        if(!this.isNewUser)
            getLoginAssertion(challstr, username, password).then((assertion)=>this.ws.send(`|/trn ${username},0,${assertion}`));
        else
            getRegisterAssertion(challstr, username, password).then((assertion)=>this.ws.send(`|/trn ${username},0,${assertion}`));
    }
    connect() {
        return new Promise((resolve, reject) => {
            // Event listener for connection open
            this.ws.on('open', () => {
                console.log('Connected to the server!');
                // login();
            });

            // Event listener for incoming messages from the server
            this.ws.on('message', (message) => {
                this.history.push(message.toString());
                console.log('Received message:', message.toString());
                const msgType = message.toString().split('|').slice(1);
                // OPTIONS
                // login
                if (MESSAGES.LOGIN === msgType[0]) {
                    console.log(`Logging in: ${this.username}, ${this.password}`);
                    this.login(message, this.username, this.password);
                }
                if(MESSAGES.LOGGED_IN === msgType[0]){
                    this.isLoggedIn = true;
                    resolve();
                }
                // i got challenged, then accept it
                if (MESSAGES.PM === msgType[0] && msgType[3].indexOf("challenge") >= 0 && msgType[3].indexOf("battle") >= 0) {
                    console.log('Accepting challenge');
                    this.ws.send(`|/accept ${msgType[1]}`) // accept challenge
                    this.isBattling = true;
                }
                // i challenged someone else
                if(message.indexOf(">battle-") === 0){
                    this.isBattling = true;
                }

                // BATTLING started
                if (this.isBattling) {
                    this.history = [];
                    this.battle(message);
                }
            });
        });
    }

    battle(message) {
        // TODO change so that it sends move after turn appears
        // TODO turn on battle timer: battle-gen9randombattle-1914233611|/timer on
        const msg = message.toString().split('|');

        if(msg[1] === BATTLE_MESSAGES.ERROR){// hopefully the second error is fixed by putting the filter but not sure about the first
            // msg[2].indexOf(' the next turn has already started') >= 0 is this an issue?
            // Sorry, too late to make a different move; the next turn has already started
            // Can't switch: You can't switch to an active Pokémon
            //  Can't move: Your pokemon doesn't have a move matching undefined
            // if(msg[2].indexOf('You can\'t switch to a') < 0 && msg[2].indexOf('The active Pokémon is trapped') <= 0){
            //     this.forceSwitch(this.pokemons)
            // }else {
            //|error|[Invalid choice] Can't move: You need a switch response
            // [Unavailable choice] Can't move: POKEMON's MOVE is disabled
                // something went wrong try a different move
            // TODO not sure what to do on these errors
            if(msg[2].indexOf('Can\'t move: You need a switch response') >= 0)
                this.forceSwitch(this.pokemons);
            else
                this.fight();
            // }
        }
        if (msg[1] === 'request') {
            this.battleId = message.toString().split('\n')[0].slice(1);
            this.request;
            try {
                this.request = JSON.parse(msg[2]);
            }catch (e) {
                console.log("something went wrong here: "+e);
                return; // TODO SyntaxError: Unexpected end of JSON input, nothing in the request, wtf.  maybe if i'm logged in it doesn't work.
            }
            this.rqid = this.request.rqid;
            // TODO fix p2 hard coded here with correct player id
            this.pokemons = this.request.side.pokemon.filter((p)=>p.condition !== "0 fnt").map((p)=>p.ident.slice('p2: '.length));
            if(this.request['forceSwitch']) {
                const pokemons = this.request.side.pokemon.filter((p)=>p.condition !== "0 fnt").map((p)=>p.ident.slice('p2: '.length));
                // switch is forced override below method to pick which mon to switch to
                this.forceSwitch(pokemons);
            } else if (this.request.side && this.request.side.name === this.username && this.request.active) {
                const pokemon = this.request.active[0]; // do i need to filter for pp===0 as well
                this.moves = pokemon.moves.filter((move)=>!move.disabled).map((move) => move.id);
                this.rqid = this.request.rqid;
                // override the below method to choose the move or switch
                // this.fight();
            }
        }
        // every turn make a move based on the data extracted, request and ref1 below
        if(msg.length - 2 >= 0 && msg[msg.length - 2] === 'turn'){
            // get opponent's pokemon
            if(message.toString().indexOf("switch|p1a") >= 0){ // TODO find my and opps player id
                // TODO also get the opponent's abilities and boost/unboost if applicable
                // TODO air balloon and other items i know, reflect and light screen, status, ect
                this.opponentPokemon = message.toString().match(/p1a:\s*(.*)/)?.[1];
                this.oppAbility = (message.toString().match(/(?<=\|-ability\|p1a: )[^\|]+/) || [])[0]
                // this.opponentPokemon+="|"+oppAbility;
            }
            try {
                this.fight();
            }catch (e) {
                console.error(e);
            }
        }
        if(this.isBattling && this.battleId && !this.isBattleTimerOn){
            this.ws.send(`${this.battleId}|/timer on`)
            this.isBattleTimerOn = true;
        }
        if(msg[1]==='inactive' && msg[2].indexOf(this.username) >= 0)
            this.fight();
        // battle is over, leave the battle
        if(msg.length - 2 >=0 && msg[msg.length -2] === 'win'){
            console.log(`I ${msg[msg.length - 1] === this.username?"won":"lost"} battle: ${this.battleId}`);
            this.updateBotStats(this.username, msg[msg.length - 1] === this.username);
            this.ws.send(`|/noreply /leave ${this.battleId}`)
            this.isBattling = false;
            this.isBattleTimerOn = false;
        }
    }

    fight(){
        // Abstract method to be overridden in subclasses after login
        throw new Error('Method not implemented.');
    }

    forceSwitch(pokemons){
        // Abstract method to be overridden in subclasses after login
        throw new Error('Method not implemented.');
    }

    choose(type, value){
        this.ws.send(`${this.battleId}|/choose ${type} ${value}|${this.rqid}`)
    }

    updateBotStats(username, isWin) {
        // Check if the file exists
        if (fs.existsSync(this.filename)) {
            // Load existing data from the file
            const rawData = fs.readFileSync(this.filename, 'utf8');
            const botData = JSON.parse(rawData);

            // Update the data for the specific username
            if (!botData[username]) {
                botData[username] = { wins: 0, losses: 0 };
            }

            if (isWin) {
                botData[username].wins++;
            } else {
                botData[username].losses++;
            }

            // Write the updated data back to the file
            fs.writeFileSync(this.filename, JSON.stringify(botData, null, 2));
        } else {
            // If the file doesn't exist, create it with the initial data for the specific username
            const botData = { [username]: { wins: isWin ? 1 : 0, losses: isWin ? 0 : 1 } };
            fs.writeFileSync(this.filename, JSON.stringify(botData, null, 2));
        }
    }
}



/*
        case MESSAGES.BATTLE_STARTED:
            if(msgType[1] === 'battle'){
                console.log('Battle Started');
                activeType = battleMessages;
            }
            break;
        case MESSAGES.REJOIN:
            if(msgType[1].indexOf('battle') >= 0){
                const b = Object.keys(JSON.parse(msgType[1])['games'])[0];
                console.log('Rejoining battle '+b);
                send(`|/join ${b}`);
                activeType = battleMessages;
            }else if(msgType[1].indexOf('games":null') >= 0){
                send(`|/cmd autojoin`);
            }
            break;
    }
}
if(msg[1] === 'init') {
    try {
        // const b = message.toString().match(/\|player\|p1\|([^|]+)\|\d+\|\n\|player\|p2\|([^|]+)\|\d+\|/).slice(1);
        const b = message.toString().match(/\|player\|p1\|([^|]+)\|\d+\|\n\|player\|p2\|([^|]+)\|[^|]+\|/).slice(1);
        if (b[1] === this.username)
            this.botPlayer = 'p2';
        console.log(`I'm player: ${this.botPlayer}`);
    }catch (e){
        // something weird happened just forget about it
    }
}

 */

/*
ref1
|switch|p1a: Meowscarada|Meowscarada, L79, M|100/100
|switch|p2a: Qwilfish|Qwilfish, L86, M|252/252
|-ability|p2a: Qwilfish|Intimidate|boost
|-unboost|p1a: Meowscarada|atk|1
|turn|1
 */