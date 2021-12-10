const vec3 = require("vec3");
const line3 = require("line3");
const genericHeuristic = require("./generic");
const rayutils = require("../util/ray");

/*
**  Determines how dangerous the terrain is in a certain direction
*/

class dangerHeuristic extends genericHeuristic {
    #globals = null;
    constructor(weighting, options) {
        super(weighting);
        if (options) {
            this.radius = options.radius || 4;
            this.depth = options.depth || 4;
            this.seperation = options.seperation || 1;
            this.sectorLength = options.sectorLength || 0.25;
        }
    }

    init() {
        this.#globals = {};
        this.#globals.pos = this.bot.entity.position;
    }

    determineCost(yaw) {
        // cast a ray directly forward to make sure the depth isn't measured inside obstacles
        let radii = new vec3(-Math.sin(yaw), 0, -Math.cos(yaw));
        let dest = this.#globals.pos.plus(radii.scaled(this.radius));
        let ray = line3.fromVec3(this.#globals.pos, dest);
        let blocks = rayutils.blockIterator(this.bot, ray, this.sectorLength);
        let intercept = rayutils.closestIntercept(this.#globals.pos, ray.polyIntercept(blocks));

        // shorten the ray accordingly so new rays can be cast directly downwards without obstruction
        ray.b = intercept ?? ray.b;
        let cost = 0;
        
        // cast rays directly down to determine an average depth
        for (let pos of ray.iterate(this.seperation)) {
            let dc = line3.fromVec3(pos, pos.offset(0, -this.depth, 0)); // "depthcast" 
            let b = rayutils.blockIterator(this.bot, dc, this.sectorLength);
            // determine a depth at pos and add it to the cost
            let intercepts = dc.polyIntercept(b);
            cost += intercepts.length > 0 ? rayutils.closestDistance(pos, intercepts) : this.depth;
        }

        // a ratio of the average depth
        return this.weighting * cost * (this.seperation / ray.a.distanceTo(ray.b)) / this.depth;
    }
}

module.exports = dangerHeuristic;