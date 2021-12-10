const assert = require("assert");

/*
**  Base class for calculating directional cost heuristics
*/

class genericHeuristic {
    bot = null;

    constructor(weighting) {
        this.weighting = weighting || 1;
    }

    setClient(bot) {
        this.bot = bot;
    }

    // initialise values for determineCost. Mainly used for reducing repeated calls in determineCost which impact performance.
    init() {
        return true;
    }

    // a ratio from 0 - 1, multiplied by the heuristic weighting. Generally higher = safer
    determineCost(yaw, destination) {
        assert.ok(yaw && destination);
        return this.weighting;
    }
}

module.exports = genericHeuristic;