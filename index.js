const assert = require(`assert`);
const evaluation = require(`./src/util/evaluation`);

class plugin {
    #heuristics = [];
    constructor(bot) {
        this.bot = bot;
    }

    loadHeuristic(heuristic) {
        heuristic.setClient(this.bot);
        this.#heuristics.push(heuristic);
    }

    steerAngle(destination, options) {
        let rotations = options.rotations || 8; // by default, calculate heuristics for 8 rotational angles
        let method = options.evaluation || 'cheapest'; // can also be 'average'

        // initialise global heuristic values
        assert.ok(this.#heuristics.length > 0, "No heuristic functions are currently loaded. Use bot.movement.loadHeuristic to register a function.");
        for (let h of this.#heuristics) h.init();

        let angles = [];
        let costs = [];

        // calculate the cost of each yaw rotation
        assert.ok(rotations > 0, "Rotations must be higher than zero.");
        for (let r = 0, yaw = this.bot.entity.yaw; r < rotations; r++) {
            let a = yaw + (r/rotations) * 2 * Math.PI;
            let c = 0; // total cost

            // find the total cost by applying heuristics
            for (let h of this.#heuristics) {
                c += h.determineCost(a, destination);
            }

            angles.push(a);
            costs.push(c);
        }

        // find the optimal angle from costs
        assert.ok(evaluation[method], "Invalid evaluation method specified. Must be either \"cheapest\" or \"average\".");
        return evaluation[method](costs, angles);
    }
}

function inject(bot) {
    bot.movement = new plugin(bot);
}

module.exports = {
    plugin: inject,
    heuristics: {
        generic: require(`./src/heuristics/generic`),
        danger: require(`./src/heuristics/danger`),
        distance: require(`./src/heuristics/distance`),
        proximity: require(`./src/heuristics/proximity`),
    }
}