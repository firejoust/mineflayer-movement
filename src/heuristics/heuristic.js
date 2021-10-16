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

    // a ratio from 0 - 1. Generally cheaper = safer
    determineCost(yaw, destination) {
        if (!this.bot) throw Error("No client session has been assigned!");
        let d = destination.minus(this.bot.entity.position);
        let r = Math.abs(yaw / (Math.atan2(d.z, d.x) - Math.PI))
        return this.weighting * r;
    }
}