 const assert = require("assert");

/*
**  Base class for calculating directional cost heuristics
*/

class costHeuristic {
    constructor(weighting) {
        this.weighting = weighting;
        this.bot = null;
    }

    get #bot() {
        assert.ok(this.bot, "No client instance has been assigned to heuristic.");
        return this.bot;
    }

    assignClient(bot) {
        this.bot = bot;
    }

    // a ratio from 0 - 1, multiplied by the heuristic weighting. Generally higher = safer
    determineCost(yaw, destination) {
        if (this.#bot) return this.weighting;
        // falsey case will stop runtime
    }
}