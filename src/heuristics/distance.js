const Vec3 = require("vec3")

const PI_HALF = Math.PI / 2
const PI_DOUBLE = Math.PI * 2
const PI_RATIO = Math.PI / 180

/*
    IDEA: START THE RAYCAST FROM THE PLAYER'S BOUNDING BOX.
    
    use the same vectors, but the first position in that direction will be
    on the player's bounding box.

    if this is used, there may not be a need to use "width" anymore
*/

module.exports.inject = function inject(bot, Set) {
    return class Distance {
        #weight    = 1
        #radius    = 5
        #spread    = 90
        #count     = 5
        #width     = 0
        #increment = 0.2

        weight    = Set(this, weight => this.#weight = weight)
        radius    = Set(this, radius => this.#radius = radius)
        spread    = Set(this, spread => this.#spread = spread)
        count     = Set(this, count => this.#count = count)
        width     = Set(this, width => this.#width = width)
        increment = Set(this, increment => this.#increment = increment)

        cost(yaw) {
            let cost = 0

            const vectors1 = new Array(this.#count) // raycast direction
            const vectors2 = new Array(this.#count) // raycast width

            const x = -Math.sin(yaw)
            const z = -Math.cos(yaw)

            const box = new Float64Array(2) // boundingbox offset

            // allocate boundingbox offset vector
            if (Math.abs(x) > Math.abs(z)) {
                box[0] = Math.sign(x)
                box[1] = z * Math.abs(1 / x)
            } else {
                box[0] = x * Math.abs(1 / z)
                box[1] = Math.sign(z)
            }

            box[0] *= 0.3
            box[1] *= 0.3

            {
                // angular components
                const total = this.#spread * PI_RATIO
                const increment = total / this.#count

                // initialise relative vectors
                for (let i = 0; i < this.#count; i++) {
                    vectors1[i] = new Float64Array(3)
                    vectors2[i] = new Float64Array(2)

                    const theta = increment * i

                    // get the horizontal/vertical 2D components
                    const h = Math.cos(theta)
                    const v = Math.sin(theta)

                    // raycast vector components
                    const x1 = x * h
                    const z1 = z * h

                    // raycast width vector components
                    const x2 = -Math.sin(yaw + PI_HALF) * h
                    const z2 = -Math.cos(yaw + PI_HALF) * h

                    vectors1[i] = [x1, v, z1]
                    vectors2[i] = [x2,    z2]
                }
            }

            {
                // find where the raycasts intercept with blocks
                for (let i = 0; i < this.#count; i++) {

                    const length = this.#radius / this.#increment

                    // initialise raycast iterator
                    for (let j = 0; j < length; j++) {
                        const pos = new Vec3(
                            vectors1[i][0] * this.#increment * j,
                            vectors1[i][1] * this.#increment * j,
                            vectors1[i][2] * this.#increment * j
                        )

                        // get absolute positional offset
                        const offset = bot.entity.position.plus(pos)

                        // add horizontal offset for the width
                        const random = Math.cos(Math.random() * PI_DOUBLE)
                        offset.x += vectors2[i][0] * random * this.#width
                        offset.z += vectors2[i][1] * random * this.#width

                        // set boundingbox offset (half player width)
                        offset.x += box[0]
                        offset.z += box[1]
                        
                        if (bot.blockAt(offset)?.boundingBox === 'block') {
                            cost += 1 - Math.sqrt(pos.x ** 2 + pos.y ** 2 + pos.z ** 2) / this.#radius
                            break
                        }
                    }
                }

                cost /= this.#count
            }

            return cost * this.#weight
        }
    }
}