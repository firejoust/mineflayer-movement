const Heuristics = require("./src/heuristics")
const Angle = require("./src/angle")

const States = [ "back", "left", "forward", "right" ]
const PI_DOUBLE = Math.PI * 2

module.exports.plugin = function inject(bot) {
    bot.movement = new Plugin(bot)
}

function Plugin(bot) {
    this.heuristic = new Heuristics(bot)

    // public
    this.setControls   = setControls
    this.getYaw        = getYaw
    this.steer         = steer

    function setControls(yaw, _angleRadius) {
        const angleRadius = Math.PI * ((_angleRadius || 100) / 180)
        const diff0 = Angle.difference(bot.entity.yaw, yaw % PI_DOUBLE)
        const diff1 = Angle.inverse(diff0)

        let index = 0

        // create a radius for each cardinal direction
        for (let i = -Math.PI; i < Math.PI; i += Math.PI/2) {

            // original angle radius
            let x0, x1
            x0 = i - angleRadius / 2
            x1 = i + angleRadius / 2

            // enable control state if destination angle within radius
            x0 <= diff0 && diff0 <= x1 || x1 <= diff0 && diff0 <= x0 ||
            x1 <= diff1 && diff1 <= x0 || x0 <= diff1 && diff1 <= x1
            ? bot.setControlState(States[index], true)
            : bot.setControlState(States[index], false)
            // next state
            index++
        }
    }

    function getYaw(_fov, _rotations, _blend) {
        const fov = _fov || 240
        const rotations = _rotations || 15
        const blend = _blend || 2

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

    function steer(yaw, _force) {
        const force = _force || true
        return bot.look(yaw, bot.entity.pitch, force)
    }
}