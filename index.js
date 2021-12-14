const assert = require(`assert`);
const evalutils = require(`./src/util/evaluation`);

class plugin {
    #heuristics = [];
    constructor(bot) {
        this.bot = bot;
    }

    loadHeuristic(heuristic) {
        heuristic.setClient(this.bot);
        this.#heuristics.push(heuristic);
    }

    loadHeuristics(...heuristics) {
        for (let h of heuristics) {
            this.loadHeuristic(h);
        }
    }

    costAngles(destination, rotations) {
        // rotations must be a positive, real number
        assert.ok(rotations && rotations % 1 === 0, "Invalid or no rotations specified. Must be a real number.");
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

        return {
            angles,
            costs
        }
    }

    steerAngle(destination, rotations, evaluation) {
        let { angles, costs } = this.costAngles(destination, rotations);

        // find the optimal angle from costs
        assert.ok(evalutils[evaluation], "Invalid evaluation method specified. Must be either \"cheapest\" or \"average\".");
        return evalutils[evaluation](costs, angles);
    }

    async steer(destination, rotations, evaluation) {
        let angle = this.steerAngle(destination, rotations, evaluation);
        return this.bot.look(angle, this.bot.entity.pitch);
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
        conformity: require(`./src/heuristics/conformity`),
    }
}