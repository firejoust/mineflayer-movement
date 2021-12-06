const genericHeuristic = require("./generic");
/*
**  Determines how dangerous the terrain is in a certain direction
*/

class dangerHeuristic extends genericHeuristic {
    constructor(weighting, radius, depth) {
        super(weighting);
        this.radius = radius;
        this.depth = depth;
    }
}

module.exports = dangerHeuristic;