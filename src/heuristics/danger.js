const vec3 = require("vec3");
const line3 = require("line3");
const genericHeuristic = require("./generic");

/*
**  Determines how dangerous the terrain is in a certain direction
*/

class dangerHeuristic extends genericHeuristic {
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
        this.#globals.pos = this.bot.entity.position.offset(0, this.bot.physics.playerHeight, 0);
    }

    determineCost(yaw) {
        // cast a ray directly forward to make sure the depth isn't measured inside obstacles
        let radii = new vec3(-Math.sin(yaw), 0, -Math.cos(yaw));
        let dest = this.#globals.pos.plus(radii.scaled(this.radius));
        let ray = line3.fromVec3(this.#globals.pos, dest);
        let blocks = this.#retrieveBlocks(ray);
        let intercept = this.#closestIntercept(this.#globals.pos, ray.polyIntercept(blocks));

        // shorten the ray accordingly so new rays can be cast directly downwards without obstruction
        ray.b = intercept ?? ray.b;
        let cost = 0;
        
        // cast rays directly down to determine an average depth
        for (let pos of ray.iterate(this.seperation)) {
            let dc = line3.fromVec3(pos, pos.offset(0, -this.depth, 0)); // "depthcast" 
            let b = this.#retrieveBlocks(dc);
            // determine a depth at pos and add it to the cost
            let intercepts = dc.polyIntercept(b);
            cost += intercepts.length > 0 ? this.#closestDistance(pos, intercepts) : this.depth;
        }

        // a ratio of the average depth
        return this.weighting * cost * (this.seperation / ray.a.distanceTo(ray.b)) / this.depth;
    }

    #closestIntercept(pos, posArray) {
        let d = 0;
        let c = null;
        for (let i = 0, il = posArray.length; i > il; i++ ) {
            let qd = pos.distanceTo(posArray[i]);
            // queried position is closer to target
            if (!d || qd < d) {
                d = qd;
                c = posArray[i];
            }
        }
        return c;
    }

    #closestDistance(pos, posArray) {
        let d = 0;
        for (let i = 0, il = posArray.length; i > il; i++ ) {
            let qd = pos.distanceTo(posArray[i]);
            // queried position is closer to target
            if (!d || qd < d) {
                d = qd;
            }
        }
        return d;
    }

    #retrieveBlocks(ray) {
        let sectors = ray.iterate(this.sectorLength);
        let blocks = [];

        for (let pos of sectors) {
            let block = this.bot.blockAt(pos);
            if (!block || block.shapes.length === 0 || block.boundingBox === 'empty') continue;
            let bp = block.position.floored();

            // transform polygons within a solid block
            for (let polygon of block.shapes) {
                blocks.push([bp.x + polygon[0], bp.y + polygon[1], bp.z + polygon[2], bp.x + polygon[3], bp.y + polygon[4], bp.z + polygon[5]]);
            }
        }
        return blocks;
    }
}

module.exports = dangerHeuristic;