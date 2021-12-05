const costHeuristic = require("./heuristic");

/*
**  Determines the angular ratio from a direction to the destination
*/

class proximityHeuristic extends costHeuristic {
    constructor(weighting) {
        super(weighting);
    }

    determineCost(yaw, destination) {
        let d = destination.minus(this.bot.entity.position);
        let a = Math.atan2(d.z, d.x);
        // use circle vectors to find a ratio (-2 < difference < 2)
        let rx = Math.abs(Math.cos(a) - Math.cos(yaw))/2;
        let ry = Math.abs(Math.sin(a) - Math.sin(yaw))/2;
        // average the ratio to determine a cost based on the angular goal difference
        let rt = (rx+ry)/2;
        return this.weighting * (1 - rt);
    }
}

module.exports = proximityHeuristic;