const Heuristics = require("./src/heuristics")
const Goals = require("./src/goals")

module.exports.plugin = function inject(bot) {
    bot.movement           = new Plugin(bot)
    bot.movement.heuristic = new Heuristics(bot)
    bot.movement.goals     = new Goals(bot)
}

function Goal(heuristicMap) {
    for (let label in heuristicMap) {
        this[label] = heuristicMap[label]
    }
}

function Plugin(bot) {
    this.setGoal   = setGoal
    this.getYaw    = getYaw
    this.steer     = steer
    this.Goal      = Goal

    function steer(yaw, _force) {
        const force = _force || true
        return bot.look(yaw, bot.entity.pitch, force)
    }

    function setGoal(goal) {
        this.heuristic.setGoal(goal)
    }

    function getYaw(_fov, _rotations, _blend) {
        const fov = _fov || 240
        const rotations = _rotations || 15
        const blend = _blend || 1

        let costs = new Float64Array(rotations)

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

        // blend the adjacent costs together
        {
            const average = new Float64Array(rotations)
            const total = blend * 2 + 1
            const half = blend + 1
            const max = rotations - blend - 1

            for (let i = 0; i <= max; i++) {
                for (let j = 1; j <= blend; j++)
                    average[i] += costs[i + j]
            }

            for (let i = blend; i < rotations; i++) {
                for (let j = 1; j <= blend; j++)
                    average[i] += costs[i - j]
            }

            for (let i = 0; i < rotations; i++) {
                average[i] += costs[i]
                // use the correct mean total
                if (blend <= i && i <= max) {
                    costs[i] = average[i] / total
                } else {
                    costs[i] = average[i] / half
                }
            }
        }

        // get the cheapest cost
        {
            let cheapest = null

            // find the rotation with the cheapest cost
            for (let i = 0; i < rotations; i++) {
                if (cheapest === null || costs[i] < costs[cheapest]) {
                    cheapest = i
                }
            }

            return base + increment * cheapest
        }
    }
}