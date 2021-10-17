/*
**  Base class for calculating directional cost heuristics
*/

class costHeuristic {
    constructor(weighting) {
        this.weighting = weighting;
        this.bot = null;
    }

    assignClient(bot) {
        this.bot = bot;
    }

    // a ratio from 0 - 1, multiplied by the heuristic weighting. Generally cheaper = safer
    determineCost(yaw, destination) {
        if (!this.bot) throw Error("No client has been assigned!");
        return 1 * this.weighting;
    }
}