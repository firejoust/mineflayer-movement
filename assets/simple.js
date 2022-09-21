const mineflayer = require("mineflayer")
const movement = require("mineflayer-movement")

const {
    ProximityHeuristic,
    ConformityHeuristic,
    DistanceHeuristic,
    DangerHeuristic
} = movement.heuristics

let plugin = movement.getPlugin(
    new ProximityHeuristic(0.7),     // weight
    new ConformityHeuristic(0.4),     // weight
    new DistanceHeuristic(1, 6, 5),   // weight, radius, count
    new DangerHeuristic(2, 2, 5, 0.2) // weight, radius, depth, spread
)

const bot = mineflayer.createBot()
bot.loadPlugin(plugin)

let follow = false

bot.on("message", json => {
    let message = json.toString()
    if (message.includes("$follow")) {
        follow = !follow
        // toggle movement
        bot.setControlState("forward", follow)
        bot.setControlState("sprint", follow)
        bot.setControlState("jump", follow)
        bot.chat(follow ? "Now following the closest player!" : "Stopped following the closest player!")
    }
})

bot.on("physicsTick", () => {
    if (follow) {
        let target = bot.nearestEntity(entity => entity.username)
        if (target) {
            // adjust yaw every tick to steer towards destination
            bot.movement.steer(target.position, 16, false)
        }
    }
});