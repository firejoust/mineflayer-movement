const mineflayer = require("mineflayer");
const movement = require("mineflayer-movement");
const bot = mineflayer.createBot({}); // etc
bot.loadPlugin(movement.plugin);

// global variables
let follow = false;
let rotations = 8; // how many directions should be checked relative to the bot
let evaluation = "cheapest"; // can also be "average" for smoother movement

/*
**  #1: Configure the heuristics that will be used
*/

let proximity = new movement.heuristics.proximity({
    weighting: 1
});
let distance = new movement.heuristics.distance({
    weighting: 1,
    radius: 5,
    count: 3,
    sectorLength: 1
});
let danger = new movement.heuristics.danger({
    weighting: 1,
    radius: 1,
    depth: 3,
    seperation: 0.5,
    sectorLength: 1
});

/*
**  #2: Specify the heuristics that the plugin should use for its functions
*/

bot.once("login", () => {
    bot.movement.loadHeuristics(proximity, distance, danger);
});

bot.on("message", json => {
    let message = json.toString();
    // when "$follow" is found in the chat, toggle following the closest player
    if (message.includes("$follow")) {
        follow = !follow;
        bot.setControlState("forward", follow);
        bot.setControlState("sprint", follow);
        bot.setControlState("jump", follow);
        bot.chat(follow ? "Now following the closest player!" : "Stopped following the closest player!");
    }
});

bot.on("physicsTick", () => {
    if (follow) {
        let target = bot.nearestEntity(entity => entity.username); // entities with "username" property will return true (players only!)
        if (target) {

/*
**  #3: Find the safest direction to face in order to walk towards the player
*/

            let yaw = bot.movement.steerAngle(target.position, rotations, evaluation);
            bot.look(yaw, bot.entity.pitch); // pitch doesn't change;
        }
    }
});