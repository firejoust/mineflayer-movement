const genericHeuristic = require("./generic");

/*
**  Determines the angular ratio from a direction to the destination
*/

class proximityHeuristic extends genericHeuristic {
    constructor(options) {
        super(options);
        this.weighting = this.options.weighting || 1;
    }

    determineCost(yaw, destination) {
        // yaw is calculated FROM the facing position, and therefore difference angle needs to be aligned
        let d = this.bot.entity.position.minus(destination);
        let a = Math.atan2(d.x, d.z);
        // use circle vectors to find a ratio (-2 < difference < 2)
        let rx = Math.abs(Math.cos(a) - Math.cos(yaw))/2;
        let ry = Math.abs(Math.sin(a) - Math.sin(yaw))/2;
        // find the maximum ratio to determine a cost based on the angular goal difference
        let rt = rx > ry ? rx : ry;
        return this.weighting * (1 - rt);
    }
}

module.exports = proximityHeuristic;