const Assert = require("assert")
const Angle  = require("../angle")

module.exports.inject = function inject(bot, Set) {
    return class Proximity {
        #weight = 0.6
        #target = null
        #avoid  = false

        weight = Set(this, weight => this.#weight = weight)
        target = Set(this, target => this.#target = target)
        avoid  = Set(this, avoid => this.#avoid = avoid)

        cost(yaw) {
            Assert.ok(this.#target, "Proximity target has not been set (null)")

            // get the shortest angle difference
            const angle = Math.atan2(
                bot.entity.position.x - this.#target.x,
                bot.entity.position.z - this.#target.z
            )

            // calculate the cost
            const cost = this.#avoid
            ? 1 - Math.abs(Angle.difference(yaw, angle) / Math.PI)
            : Math.abs(Angle.difference(yaw, angle) / Math.PI)

            return cost * this.#weight
        }
    }
}