const Heuristic = require("./heuristic")

/*
**  Determines the angular ratio from a direction to the destination
**
**  Examples:
**  - Looking directly towards target (0° angular difference) = 1.
**  - looking away from target (180° angular difference) = 0.
*/

class ProximityHeuristic extends Heuristic {
    constructor(weight) {
        super()
        this.weight = weight || 0.65
    }

    cost(yaw, destination) {
        // yaw is calculated FROM the facing position, and therefore difference angle needs to be aligned
        let d = this.client.entity.position.minus(destination)
        let a = Math.atan2(d.x, d.z)
        // use circle vectors to find a ratio (-2 < difference < 2)
        let rx = Math.abs(Math.cos(a) - Math.cos(yaw))/2
        let ry = Math.abs(Math.sin(a) - Math.sin(yaw))/2
        // find the maximum ratio to determine a cost based on the angular goal difference
        let rt = rx > ry ? rx : ry
        return this.weight * (1 - rt)
    }
}

module.exports = ProximityHeuristic