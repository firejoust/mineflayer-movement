/*
**  determine how visible the terrain is in a certain direction
**
**  KEY:
**  - "A" represents the location of the player's head
**  - "[ ]" represents a block
**  - "-" represents the raycast
**  - "x" represents an intercept with a block
**      /  
**  [A]---------[x]
**  [ ] \       [ ]
**  [ ][ ][x][ ][ ]
*/

const Vec3 = require("vec3")
const Line3 = require("line3")
const Heuristic = require("./heuristic")
const Iterator = require("../utils/iterator")

class DistanceHeuristic extends Heuristic {
    constructor(weight, radius, count) {
        super(weight, radius, count)
        this.weight = weight
        this.radius = radius
        this.count = count
    }

    init() {
        // frame of vision
        this.spread = (Math.PI/2) * (1 - 1/this.count)

        // the pitch offset for the bottom raycast
        this.offset = (Math.PI - this.spread) / 2

        // the position that rays are cast from
        this.position = this.client.entity.position.offset(0, this.client.physics.playerHeight, 0)
    }

    cost(yaw) {
        let cost = 0

        // find where the raycast will end
        let destination = new Vec3(
            this.position.x - (Math.sin(yaw) * this.radius),
            this.position.y,
            this.position.z - (Math.cos(yaw) * this.radius)
        )

        // create the initial raycast
        let ray = Line3.fromVec3(this.position, destination)

        // create more rays using the initial ray
        for (let r = 0; r < this.count; r++) {

            // get pitch offset
            let a = (this.offset - Math.PI/2) + ((r/this.count) * this.spread)
            
            // get the new destination from the pitch offset
            let p = ray.b.offset(0, Math.sin(a) * this.radius, 0)

            // initalise the raycast
            let l = Line3.fromVec3(this.position, p)

            // find where the raycast intercepts with a block
            let intercept

            Iterator.iterBlocks(l, (x, y, z) => {
                let pos = new Vec3(x, y, z)
                let block = this.client.blockAt(pos)

                if (block && block.boundingBox === "block") {
                    let rect = [
                        [x, y, z],
                        [x + 1, y + 1, z + 1]
                    ]

                    let entrance = l.rectIntercept(rect, l.rectFace(false))
                    let exit     = l.rectIntercept(rect, l.rectFace(true))

                    // use at least one
                    intercept = entrance ?? exit
                    return Boolean(intercept)
                }
            })

            cost += intercept ? this.position.distanceTo(intercept) : this.radius
        }

        // determine the final cost
        return this.weight * (cost/this.count) / this.radius
    }
}

module.exports = DistanceHeuristic