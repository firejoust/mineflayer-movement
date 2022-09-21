
/*
**  Determines the angular ratio from where the player's facing to where they will face.
**
**  Examples:
**  - Maximum conformity: New angle is the same as player's current yaw. (0° angular difference) = 1.
**  - Minimum conformity: New angle is the opposite direction of where the player's heading (180° angular difference) = 0.
*/

const Heuristic = require("./heuristic")

class ConformityHeuristic extends Heuristic {
    constructor(weight) {
        super(weight)
        this.weight = weight
    }

    cost(yaw) {
        // use circle vectors to find a ratio (-2 < difference < 2)
        let rx = Math.abs(Math.cos(this.client.entity.yaw) - Math.cos(yaw))/2
        let ry = Math.abs(Math.sin(this.client.entity.yaw) - Math.sin(yaw))/2
        // find the maximum ratio to determine a cost based on the angular yaw difference
        let rt = rx > ry ? rx : ry
        return this.weight * (1 - rt)
    }
}

module.exports = ConformityHeuristic