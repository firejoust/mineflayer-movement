const Vec3 = require("vec3")

const PI_RATIO = Math.PI / 180

module.exports.inject = function inject(bot, Set) {
    return class Distance {
        #weight    = 1
        #radius    = 5
        #spread    = 40
        #count     = 5
        #increment = 0.2

        weight    = Set(this, weight => this.#weight = weight)
        radius    = Set(this, radius => this.#radius = radius)
        spread    = Set(this, spread => this.#spread = spread)
        count     = Set(this, count => this.#count = count)
        increment = Set(this, increment => this.#increment = increment)

        cost(yaw) {
            let cost = 0
            const vectors1 = new Array(this.#count) // raycast direction

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

                    const theta = increment * i

                    // get the horizontal/vertical 2D components
                    const h = Math.cos(theta)
                    const v = Math.sin(theta)

                    // raycast vector components
                    const x1 = x * h
                    const z1 = z * h

                    vectors1[i] = [x1, v, z1]
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