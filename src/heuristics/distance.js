const genericHeuristic = require("./generic");

/*
**  Determines how clear the terrain is in a certain direction.
*/

class distanceHeuristic extends genericHeuristic {
    constructor(weighting, radius, count) {
        super(weighting);
        this.radius = radius || 5;
        this.count = count || 1;
    }
}

module.exports = distanceHeuristic;