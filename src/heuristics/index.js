const Distance   = require("./distance")
const Danger     = require("./danger")
const Proximity  = require("./proximity")
const Conformity = require("./conformity")

const Set = (instance, callback) => {
    return (...args) => {
        callback(...args)
        return instance
    }
}

module.exports = function Heuristics(bot) {
    const Heuristics = {
        Distance:   Distance.inject(bot, Set),
        Danger:     Danger.inject(bot, Set),
        Proximity:  Proximity.inject(bot, Set),
        Conformity: Conformity.inject(bot, Set)
    }

    return new class Plugin {
        active = {}

        setGoal(goal) {
            this.active = goal
        }

        new(type) {
            switch (type) {
                case 'distance':
                    return new Heuristics.Distance()

                case 'danger':
                    return new Heuristics.Danger()

                case 'proximity':
                    return new Heuristics.Proximity()
                    
                case 'conformity':
                    return new Heuristics.Conformity()

                default:
                    throw new TypeError("Invalid heuristic type specified!")
            }
        }

        register(type, label) {
            const _label = label || type

            this.active[_label] = null

            switch (type) {
                case 'distance':
                    this.active[_label] = new Heuristics.Distance()
                    return this.active[_label]

                case 'danger':
                    this.active[_label] = new Heuristics.Danger()
                    return this.active[_label]

                case 'proximity':
                    this.active[_label] = new Heuristics.Proximity()
                    return this.active[_label]
                    
                case 'conformity':
                    this.active[_label] = new Heuristics.Conformity()
                    return this.active[_label]
            }

            if (this.active[_label] === null) {
                throw new TypeError("Invalid heuristic type specified!")
            }

            return null
        }

        get(label) {
            if (this.active[label] === undefined) {
                throw new Error(`No active heuristics found with label '${label}'`)
            }
            return this.active[label]
        }
    }
}