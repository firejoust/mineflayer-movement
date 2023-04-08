const Angle  = require("../angle")

module.exports.inject = function inject(bot, Set) {
    return class Proximity {
        #weight = 0.7
        #target = null
        #avoid  = false

        weight = Set(this, weight => this.#weight = weight)
        target = Set(this, target => this.#target = target)
        avoid  = Set(this, avoid => this.#avoid = avoid)

        configure = Set(this, object => {
            for (let key in object) {
                try {
                    this[key](object[key])
                } catch (e) {
                    throw new Error(`Cannot configure invalid heuristic option ${key}`)
                }
            }
        })

        cost(yaw) {
            if (this.#target === null) return 0

            // get the shortest angle difference
            const angle = Math.atan2(
                bot.entity.position.x - this.#target.x,
                bot.entity.position.z - this.#target.z
            )

            // reverse cost weight if avoid is enabled
            if (this.#avoid) {
                return this.#weight * (1 - Math.abs(Angle.difference(yaw, angle) / Math.PI))
            } else {
                return this.#weight * Math.abs(Angle.difference(yaw, angle) / Math.PI)
            }
        }
    }
}