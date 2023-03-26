const Heuristics = require("./src/heuristics")

module.exports.plugin = function inject(bot) {
    bot.movement = new Plugin(bot)
}

function Plugin(bot) {
    this.heuristic = new Heuristics(bot)

    // public
    this.setControls   = setControls
    this.getYaw        = getYaw
    this.steer         = steer

    function setControls(yaw, angleRadius) {

    }

    function getYaw(fov, rotations) {
        const costs = new Float64Array(rotations)

        // calculate the angular components
        const total = fov * Math.PI / 180
        const increment = total / rotations
        const base = bot.entity.yaw + increment / 2 - total / 2

        // add the total cost for each rotation
        for (let i = 0; i < rotations; i++) {
            for (let key in this.heuristic.active) {
                costs[i] += this.heuristic.active[key].cost(base + increment * i)
            }
        }

        let cheapest = null

        // find the rotation with the cheapest cost
        for (let i = 0; i < rotations; i++) {
            if (cheapest === null || costs[i] < costs[cheapest]) {
                cheapest = i
            }
        }

        return base + increment * cheapest
    }

    function steer(yaw, force) {
        return bot.look(yaw, bot.entity.pitch, force)
    }
}































/*
const bot = {}

// FOV?

bot.movement.setHeuristics(
    new bot.movement.heuristics.Distance(1)
        .radius(4)
        .count(3)
        .spread(20),
    new bot.movement.heuristics.Danger(1)
        .radius(2)
        .depth(5)
        .spread(0.25),
    new bot.movement.heuristics.Proximity(2)
        .target(position)
        .avoid(true)
)

const yaw = bot.movement.getYaw(fov, rotations)
bot.movement.setControls(yaw, angleRadius)
bot.movement.steer(yaw, forceLook)
*/