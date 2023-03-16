const States = [ "back", "left", "forward", "right" ]

const Angle = require("./src/utils/angle")
const Evaluation = require("./src/utils/evaluation")
const Cost = require("./src/utils/cost")

class Movement {
    #client
    #totalWeight
    #heuristics
    
    constructor(client, heuristics) {
        this.#client = client
        this.#totalWeight = 0
        this.#heuristics = heuristics
        // set the client for each heuristic
        this.#heuristics.forEach(_ => _.setClient(this.#client))
        this.#heuristics.forEach(_ => this.#totalWeight += _.weight)
    }

    setHeuristics(...heuristics) {
        this.#totalWeight = 0
        this.#heuristics = heuristics
        this.#heuristics.forEach(_ => _.setClient(this.#client))
        this.#heuristics.forEach(_ => this.#totalWeight += _.weight)
    }

    getRotations(position, rotations) {
        let angles, costs

        // allocate enough room
        angles = new Float64Array(rotations)
        costs = new Float64Array(rotations)

        // initialise heuristic constants
        this.#heuristics.forEach(_ => _.init())

        // calculate the cost of each yaw rotation
        for (let r = 0; r < rotations; r++) {
            let a = this.#client.entity.yaw + (2 * Math.PI * r) / rotations
            let c = 0

            // find the total cost by applying heuristics
            for (let h of this.#heuristics) {
                c += h.cost(a, position)
            }

            angles[r] = a
            costs[r]  = c / this.#totalWeight // put cost within a 0-1 ratio
        }

        return {
            angles,
            costs
        }
    }

    getRotation(position, rotations, average) {
        let { angles, costs } = this.getRotations(position, rotations)
        let index = Number(Boolean(average))
        return {
            yaw: Evaluation[index](costs, angles),
            cost: Cost[index](costs, angles)
        }
    }

    getYaw(position, rotations, average) {
        let { angles, costs } = this.getRotations(position, rotations)
        let index = Number(Boolean(average))
        return Evaluation[index](costs, angles)
    }

    async steer(position, rotations, evaluation) {
        return this.#client.look(
            this.getYaw(position, rotations, evaluation),
            this.#client.entity.pitch
        )
    }

    async move(yaw, headless) {
        if (headless) {
            let index = 0
            let radius = Math.PI * 2 / 3
            let diff0 = Angle.difference(this.#client.entity.yaw, yaw)
            let diff1 = Angle.inverse(diff0)
            // create a radius for each cardinal direction
            for (let i = -Math.PI; i < Math.PI; i += Math.PI/2) {
                // original angle radius
                let x0, x1
                x0 = i - radius / 2
                x1 = i + radius / 2
                // enable control state if destination angle within radius
                x0 <= diff0 && diff0 <= x1 || x1 <= diff0 && diff0 <= x0 ||
                x1 <= diff1 && diff1 <= x0 || x0 <= diff1 && diff1 <= x1
                ? this.#client.setControlState(States[index], true)
                : this.#client.setControlState(States[index], false)
                // next state
                index++
            }
        } else {
            States.forEach(state => this.#client.setControlState(state, state === "forward"))
            return this.#client.look(yaw, this.#client.entity.pitch)
        }
    }

    stop() {
        for (let state of States) {
            this.#client.setControlState(state, false)
        }
    }
}

function getPlugin(...heuristics) {
    return function inject(client) {
        client.movement = new Movement(client, heuristics)
    }
}

module.exports = {
    heuristics: require("./src/heuristics"),
    getPlugin
}