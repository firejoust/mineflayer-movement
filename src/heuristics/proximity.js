const Assert = require("assert")
const Angle  = require("../angle")

module.exports.inject = function inject(bot, Set) {
    return class Proximity {
        #weight   = 1
        #position = null
        #avoid    = false

        position = Set(this, position => this.#position = position)
        avoid    = Set(this, avoid => this.#avoid = avoid)

        constructor(weight) {
            this.#weight = weight
        }

        cost(yaw) {
            Assert.ok(this.#position, "Proximity position has not been set (null)")

            // get the shortest angle difference
            const angle = Math.atan2(
                bot.entity.position.x - this.#position.x,
                bot.entity.position.z - this.#position.z
            )
            // calculate the cost
            const cost = this.#avoid
            ? 1 - Math.abs(Angle.difference(yaw, angle) / Math.PI)
            : Math.abs(Angle.difference(yaw, angle) / Math.PI)

            return  cost * this.#weight
        }
    }
}