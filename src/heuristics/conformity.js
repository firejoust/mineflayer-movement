const Angle  = require("../angle")

module.exports.inject = function inject(bot, Set) {
    return class Conformity {
        #weight = 1
        weight  = Set(this, weight => this.#weight = weight)

        cost(yaw) {
            return Math.abs(Angle.difference(yaw, bot.entity.yaw) / Math.PI) * this.#weight
        }
    }
}