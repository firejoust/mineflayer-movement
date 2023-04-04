const Angle  = require("../angle")

module.exports.inject = function inject(bot, Set) {
    return class Conformity {
        #weight = 0.2
        #avoid  = false

        weight = Set(this, weight => this.#weight = weight)
        avoid  = Set(this, avoid => this.#avoid = avoid)

        cost(yaw) {
            if (this.#avoid) {
                return this.#weight * (1 - Math.abs(Angle.difference(yaw, bot.entity.yaw) / Math.PI))
            } else {
                return this.#weight * Math.abs(Angle.difference(yaw, bot.entity.yaw) / Math.PI)
            }
        }
    }
}