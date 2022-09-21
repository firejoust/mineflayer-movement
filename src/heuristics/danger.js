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

const Vec3 = require("vec3")
const Line3 = require("line3")
const Heuristic = require("./heuristic")
const Iterator = require("../utils/iterator")

class DangerHeuristic extends Heuristic {
    constructor(weight, radius, depth, spread) {
        super(weight, radius, depth, spread)
        this.weight = weight
        this.radius = radius
        this.depth = depth
        this.spread = spread
    }

    init() {
        this.position = this.client.entity.position
    }

    cost(yaw) {
        let cost, total
        cost = 0
        total = 0

        // cast a ray directly forward to make sure the depth isn't measured inside walls
        let destination = new Vec3(
            this.position.x - (Math.sin(yaw) * this.radius),
            this.position.y,
            this.position.z - (Math.cos(yaw) * this.radius)
        )

        let ray = Line3.fromVec3(this.position, destination)

        let intercept

        Iterator.iterBlocks(ray, (x, y, z) => {
            let pos = new Vec3(x, y, z)
            let block = this.client.blockAt(pos)

            if (block && block.boundingBox === "block") {
                let rect = [
                    [x, y, z],
                    [x + 1, y + 1, z + 1]
                ]

                let entrance = ray.rectIntercept(rect, ray.rectFace(false))
                let exit     = ray.rectIntercept(rect, ray.rectFace(true))

                // use at least one
                intercept = entrance ?? exit
                return Boolean(intercept)
            }
        })

        // use intercept to determine where the depth checks stop
        ray = Line3.fromVec3(this.position, intercept ?? ray.b)
       
        // find multiple points sitting on the ray
        for (let a of ray.iterate(this.spread)) {

            // determine the maximum depth of the ray
            let b = a.offset(0, -this.depth, 0)

            // cast ray downwards to get the real depth
            ray = Line3.fromVec3(a, b)

            // reset the intercept
            intercept = null

            Iterator.iterBlocks(ray, (x, y, z) => {
                let pos = new Vec3(x, y, z)
                let block = this.client.blockAt(pos)
    
                if (block && block.boundingBox === "block") {
                    let rect = [
                        [x, y, z],
                        [x + 1, y + 1, z + 1]
                    ]
    
                    let entrance = ray.rectIntercept(rect, ray.rectFace(false))
                    let exit     = ray.rectIntercept(rect, ray.rectFace(true))
    
                    // use at least one
                    intercept = entrance ?? exit
                    return Boolean(intercept)
                }
            })

            total += 1
            cost  += this.depth - (intercept ? a.distanceTo(intercept) : this.depth)
        }

        // the average depth
        return this.weight * (cost / (this.depth * total || 1))
    }
}

module.exports = DangerHeuristic