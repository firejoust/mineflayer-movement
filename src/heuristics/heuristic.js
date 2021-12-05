 const assert = require("assert");

/*
**  Base class for calculating directional cost heuristics
*/

class costHeuristic {
    bot = null;

    constructor(weighting) {
        this.weighting = weighting || 1;
    }

    setClient(bot) {
        this.bot = bot;
    }

    // a ratio from 0 - 1, multiplied by the heuristic weighting. Generally higher = safer
    determineCost(yaw, destination) {
        assert.ok(yaw && destination);
        return this.weighting;
    }
}

module.exports = costHeuristic;