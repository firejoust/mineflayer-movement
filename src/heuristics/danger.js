const genericHeuristic = require("./generic");
/*
**  Determines how dangerous the terrain is in a certain direction
*/

class dangerHeuristic extends genericHeuristic {
    constructor(weighting, options) {
        super(weighting);
        if (options) {
            this.radius = options.radius || 4;
            this.depth = options.depth || 4;
        }
    }
}

module.exports = dangerHeuristic;