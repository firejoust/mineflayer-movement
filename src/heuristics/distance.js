const vec3 = require("vec3");
const line3 = require("line3");
const genericHeuristic = require("./generic");
const rayutils = require("../util/ray");

/*
**  Determines how clear the terrain is in a certain direction.
**
**  KEY:
**  - "A" represents the location of the player's head
**  - "[ ]" represents a block
**  - "-" represents the raycast
**  - "x" represents an intercept with a block
**
**  [A]---------[x]
**  [ ]         [ ]
**  [ ][ ][ ][ ][ ]
*/

class distanceHeuristic extends genericHeuristic {
    constructor(options) {
        super(options);
        this.weighting = this.options.weighting || 1;
        this.radius = this.options.radius || 5;
        this.count = this.options.count || 1;
        this.pitch = this.options.offset || 0;
        this.sectorLength = this.options.sectorLength || 0.25;
    }

    init() {
        // determine an angle to start casting rays from (centered)
        this.globals.spread = (Math.PI/2) * (1 - this.count ** -1);
        this.globals.offset = (Math.PI - this.globals.spread)/2;
        this.globals.pitch = this.pitch ? this.bot.entity.pitch : 0;

        // determine a position where rays should be casted from
        this.globals.pos = this.bot.entity.position.offset(0, this.bot.physics.playerHeight, 0);
    }

    determineCost(yaw) {
        // find end of raycast
        let radii = new vec3(-Math.sin(yaw), 0, -Math.cos(yaw));
        let dest = this.globals.pos.plus(radii.scaled(this.radius));

        // set an initial ray, supplementing the vertical component with angular offsets
        let ray = line3.fromVec3(this.globals.pos, dest);
        let cost = 0;

        // evenly spread the vertical angular raycasts
        for (let r = 0; r < this.count; r++) {
            let a = this.globals.pitch + (this.globals.offset - Math.PI/2) + ((r/this.count) * this.globals.spread);
            let l = line3.fromVec3(ray.a, ray.b.offset(0, this.radius * Math.sin(a), 0));
            let b = rayutils.blockIterator(this.bot, l, this.sectorLength);
            // find the closest intercept and use it to scale the cost
            let intercepts = l.polyIntercept(b);
            cost += intercepts.length > 0 ? rayutils.closestDistance(this.globals.pos, intercepts) : this.radius;
        }

        // average the cumulative costs & determine its ratio according to the weighting
        return this.weighting * (cost/this.count) / this.radius;
    }
}

module.exports = distanceHeuristic;