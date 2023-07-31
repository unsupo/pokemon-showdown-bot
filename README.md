# Pokemon Showdown Bot
This is a bot framework for pokemon showdown.  Simply implement the `AbstractPokemonShowdownBot.js` and it's
methods `fight` and `forceSwitch`.

Neither of the bots created so far really stand any chance versus a human.

### Random bot
Obviously the random bot is worse and literally picks random moves.

When it needs to switch it'll pick a random mon.


### StrongestMoveBot
This bot picks the strongest move, but it's wighted so it could pick
and inferior move.  Figured this was better to make it less predictable.

Also, it weights non-damaging moves at 20% chance to pick, yeah this is really
dumb because it could pick para even if opp is para'd already ect.

When it needs to switch it'll just pick random for now


## TODO
- Random bug fixes
- bot creation so i can test a whole bunch of bots at once
- bot vs bot so i can test how much a change has improved a bot (right now get error).  It can do a ranked match no problem
- parsing more opponent data
  - boosts
  - items
- have StrongestMoveBot pick the strongest mon to switch to
- StrongestMoveBot switch out if it's clearly a bad match up have no viable moves ect 
- MinMaxBot to use the minimax algorithm to pick the best move
- Reinforced learning Bot, have a bot learn how to pick the best move
  by learning after every match
- Have gym leaders that humans can challenge.  Maybe the bot keeps track of the usernames
that have beaten the gym leaders and that allows them to challenge the elite for then the champion 
- Have an api (UI) that people can send it a team and they can test their team against that team or
even test the ai against itself with different teams.