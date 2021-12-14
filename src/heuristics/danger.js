const vec3 = require("vec3");
const line3 = require("line3");
const genericHeuristic = require("./generic");
const rayutils = require("../util/ray");

/*
**  Determines how dangerous the terrain is in a certain direction.
**
**  KEY:
**  - "A" represents the location of the player's head
**  - "[ ]" represents a block
**  - "-" represents the primary raycast
**  - "|" represents the depthcast(s) branching from the primary raycast
**  - "x" represents an intercept with a block
**
**  [A]         [ ][ ][ ]
**  [ ]---------[x]   [ ]
**  [ ] |  |  |       [ ]
**  [ ] |  |  |       [ ]
**  [ ][x][x][x][ ][ ][ ]
*/

class dangerHeuristic extends genericHeuristic {
    constructor(options) {
        super(options);
        this.weighting = this.options.weighting || 1;
        this.radius = this.options.radius || 1;
        this.depth = this.options.depth || 3;
        this.seperation = this.options.seperation || 0.25;
        this.sectorLength = this.options.sectorLength || 0.5;
    }

    init() {
        this.globals.pos = this.bot.entity.position;
    }

    determineCost(yaw) {
        let castCount = 0;
        let cost = 0;

        // cast a ray directly forward to make sure the depth isn't measured inside walls
        let radii = new vec3(-Math.sin(yaw), 0, -Math.cos(yaw));
        let dest = this.globals.pos.plus(radii.scaled(this.radius));
        let ray = line3.fromVec3(this.globals.pos, dest);

        // determine if the primary ray being cast forwards intercepts with anything
        let blocks = rayutils.blockIterator(this.bot, ray, this.sectorLength);
        let intercept = rayutils.closestIntercept(this.globals.pos, ray.polyIntercept(blocks));

        // shorten the ray accordingly so rays aren't cast through walls
        ray.b = intercept ?? ray.b;
        
        // cast rays directly downward to determine an average depth
        for (let pos of ray.iterate(this.seperation)) {
            // "depthcast" rays branch from the primary ray 
            let dc = line3.fromVec3(pos, pos.offset(0, -this.depth, 0));
            let b = rayutils.blockIterator(this.bot, dc, this.sectorLength);
            // determine a depth at pos and add it to the cost
            let intercepts = dc.polyIntercept(b);
            cost += this.depth - (intercepts.length > 0 ? rayutils.closestDistance(pos, intercepts) : this.depth);
            castCount++;
        }

        // a ratio of the average depth
        return (this.weighting * cost) / (this.depth * castCount || 1);
    }
}

module.exports = dangerHeuristic;