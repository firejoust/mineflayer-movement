const Set = (this, callback) => {
    return (...args) => {
        callback(args)
        return this
    }
}

module.exports.inject = function inject(bot) {
    return new Heuristics(bot)
}

function Heuristics(bot) {
    this.Distance = class Distance {
        #weight = 1
        #radius = 5
        #spread = 15
        #count  = 5

        radius = Set(this, radius => this.#radius = radius)
        spread = Set(this, spread => this.#spread = spread)
        count = Set(this, count => this.#count = count)

        constructor(weight) {
            this.#weight = weight
        }

        cost(yaw) {

        }
    }

    this.Danger = class Danger {
        #weight  = 1
        #radius  = 5
        #count   = 20
        #depth   = 3
        #descend = false

        radius  = Set(this, radius => this.#radius = radius)
        depth   = Set(this, depth => this.#depth = depth)
        spread  = Set(this, spread => this.#spread = spread)
        descend = Set(this, descend => this.#descend = descend)

        constructor(weight) {
            this.#weight = weight
        }

        cost(yaw) {

        }
    }

    this.Proximity = class Proximity {
        #weight = 1
        #target = null
        #avoid  = false

        target = Set(this, target => this.#target = target)
        avoid  = Set(this, avoid => this.#avoid = avoid)

        constructor(weight) {
            this.#weight = weight
        }

        cost(yaw) {

        }
    }
}