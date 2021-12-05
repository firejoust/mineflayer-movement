const assert = require(`assert`);
const evaluation = require(`./src/util/evaluation`);

class plugin {
    constructor(bot) {
        this.bot = bot;
    }

    steerAngle(destination, heuristics, options) {
        let rotations = options.rotations || 8; // by default, calculate heuristics for 8 rotational angles
        let method = options.evaluation || 'cheapest'; // can also be 'average'

        assert.ok(heuristics.length > 0, "At least one heuristic must be specified.");
        assert.ok(rotations > 0, "Rotations must be higher than zero.");
        assert.ok(evaluation[method], "Invalid evaluation method specified. Must be either \"cheapest\" or \"average\".");

        // assign bot class required to calculate heuristic costs
        for (let h of heuristics) {
            h.setClient(this.bot);
        }

        let angles = [];
        let costs = [];

        // calculate the cost of each yaw rotation
        for (let r = 0, yaw = this.bot.entity.yaw + Math.PI; r < rotations; r++) {
            let a = yaw + (r/rotations) * 2 * Math.PI;
            let c = 0; // total cost

            // find the total cost by applying heuristics
            for (let h of heuristics) {
                c += h.determineCost(a, destination);
                console.log(a);
            }

            angles.push(a);
            costs.push(c);
        }

        // find the optimal angle from costs
        return evaluation[method](costs, angles);
    }
}

function inject(bot) {
    bot.movement = new plugin(bot);
}

module.exports = {
    plugin: inject,
    heuristics: {
        genericHeuristic: require(`./src/heuristics/heuristic`),
        dangerHeuristic: require(`./src/heuristics/danger`),
        distanceHeuristic: require(`./src/heuristics/distance`),
        proximityHeuristic: require(`./src/heuristics/proximity`),
    }
}