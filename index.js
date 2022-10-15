const Evaluation = require("./src/utils/evaluation")
const Cost = require("./src/utils/cost")

class Movement {
    #client
    #heuristics
    #totalWeight
    
    constructor(client, heuristics) {
        this.#client = client
        this.#heuristics = heuristics
        this.#totalWeight = 0
        // set the client for each heuristic
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

    steer(position, rotations, evaluation) {
        return this.#client.look(
            this.getYaw(position, rotations, evaluation),
            this.#client.entity.pitch
        )
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