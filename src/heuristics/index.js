const Distance   = require("./distance")
const Danger     = require("./danger")
const Proximity  = require("./proximity")
const Conformity = require("./conformity")

module.exports.inject = function inject(bot) {
    const Set = (instance, callback) => {
        return (...args) => {
            callback(...args)
            return instance
        }
    }

    return {
        Distance:   Distance.inject(bot, Set),
        Danger:     Danger.inject(bot, Set),
        Proximity:  Proximity.inject(bot, Set),
        Conformity: Conformity.inject(bot, Set)
    }
}